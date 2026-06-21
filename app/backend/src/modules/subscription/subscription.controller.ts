import {
	Controller,
	Post,
	Get,
	Body,
	Headers,
	Req,
	UseGuards,
	BadRequestException,
	NotFoundException,
	HttpCode,
} from "@nestjs/common";
import { Request } from "express";
import { StripeService } from "./stripe.service";
import { UsersService } from "../users/users.service";
import { AiUsageService } from "../ai/services/ai-usage.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

interface JwtPayload {
	id: string;
	email: string;
}

@Controller("subscription")
export class SubscriptionController {
	constructor(
		private readonly stripeService: StripeService,
		private readonly usersService: UsersService,
		private readonly aiUsageService: AiUsageService,
	) {}

	@Post("checkout")
	@UseGuards(JwtAuthGuard)
	async checkout(@CurrentUser() user: JwtPayload) {
		const dbUser = await this.usersService.findOne(user.id);
		return this.stripeService.createCheckoutSession(dbUser.id, dbUser.email);
	}

	@Post("portal")
	@UseGuards(JwtAuthGuard)
	async portal(@CurrentUser() user: JwtPayload) {
		const dbUser = await this.usersService.findOne(user.id);
		if (!dbUser.stripeCustomerId) {
			throw new BadRequestException(
				"No Stripe customer associated with this account. Please subscribe first.",
			);
		}
		return this.stripeService.createCustomerPortalSession(
			dbUser.stripeCustomerId,
		);
	}

	@Get("status")
	@UseGuards(JwtAuthGuard)
	async getStatus(@CurrentUser() user: JwtPayload) {
		return this.aiUsageService.getSubscriptionStatus(user.id);
	}

	@Post("webhook")
	@HttpCode(200)
	async handleWebhook(
		@Req() req: Request & { rawBody?: Buffer },
		@Headers("stripe-signature") signature: string,
	) {
		if (!signature) {
			throw new BadRequestException("Missing stripe-signature header");
		}

		const rawBody = req.rawBody;
		if (!rawBody) {
			throw new BadRequestException(
				"Raw request body is required for signature verification",
			);
		}

		const event = this.stripeService.constructEvent(rawBody, signature);

		console.log(`[Stripe Webhook] Received event type: ${event.type}`);

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as any;
				const userId = session.client_reference_id || session.metadata?.userId;
				const stripeCustomerId = session.customer as string;
				const stripeSubscriptionId = session.subscription as string;

				if (!userId) {
					console.error(
						"[Stripe Webhook] No userId found in checkout.session.completed session",
					);
					break;
				}
				// Fetch subscription to get current period end date
				let subscriptionExpiresAt: Date | null = null;
				if (stripeSubscriptionId) {
					try {
						const subscription =
							await this.stripeService.retrieveSubscription(
								stripeSubscriptionId,
							);
						const periodEnd = subscription.items?.data?.[0]?.current_period_end;

						const subscriptionExpiresAt =
							typeof periodEnd === "number" ? new Date(periodEnd * 1000) : null;
					} catch (err) {
						console.error(
							"[Stripe Webhook] Failed to retrieve subscription details",
							err,
						);
					}
				}

				await this.usersService.updateSubscription(userId, {
					subscriptionTier: "pro",
					stripeCustomerId,
					stripeSubscriptionId,
					subscriptionExpiresAt,
					subscribedAt: new Date(),
				});
				console.log(
					`[Stripe Webhook] User ${userId} upgraded to Pro. Sub: ${stripeSubscriptionId}`,
				);
				break;
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as any;
				const stripeSubscriptionId = subscription.id;
				const user =
					await this.usersService.findByStripeSubscriptionId(
						stripeSubscriptionId,
					);

				if (user) {
					await this.usersService.updateSubscription(user.id, {
						subscriptionTier: "free",
						stripeSubscriptionId: null,
						subscriptionExpiresAt: null,
					});
					console.log(
						`[Stripe Webhook] User ${user.id} subscription deleted. Reverted to Free tier.`,
					);
				} else {
					console.warn(
						`[Stripe Webhook] No user found for subscription ID: ${stripeSubscriptionId}`,
					);
				}
				break;
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as any;
				const stripeSubscriptionId = subscription.id;
				const user =
					await this.usersService.findByStripeSubscriptionId(
						stripeSubscriptionId,
					);
				if (user) {
					const periodEnd = subscription.items?.data?.[0]?.current_period_end;

					const subscriptionExpiresAt =
						typeof periodEnd === "number" ? new Date(periodEnd * 1000) : null;
					const isPro = ["active", "trialing"].includes(subscription.status);

					await this.usersService.updateSubscription(user.id, {
						subscriptionTier: isPro ? "pro" : "free",
						subscriptionExpiresAt,
					});
					console.log(
						`[Stripe Webhook] User ${user.id} subscription updated. Status: ${subscription.status}`,
					);
				} else {
					console.warn(
						`[Stripe Webhook] No user found for subscription ID: ${stripeSubscriptionId}`,
					);
				}
				break;
			}

			default:
				console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
		}

		return { received: true };
	}
}
