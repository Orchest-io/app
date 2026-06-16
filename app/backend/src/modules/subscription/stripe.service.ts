import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
	private stripe: Stripe.Stripe | null = null;
	private apiKey: string | undefined;

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get<string>("STRIPE_SECRET_KEY");
		if (!this.apiKey) {
			console.warn(
				"STRIPE_SECRET_KEY is not defined in environment variables. Stripe functionality will be disabled.",
			);
		}
	}

	private getStripeInstance(): Stripe.Stripe {
		if (!this.apiKey) {
			throw new BadRequestException(
				"Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.",
			);
		}
		
		if (!this.stripe) {
			this.stripe = new Stripe(this.apiKey);
		}
		
		return this.stripe;
	}

	async createCheckoutSession(
		userId: string,
		email: string,
	): Promise<{ url: string }> {
		const stripe = this.getStripeInstance();
		const priceId = this.configService.get<string>("STRIPE_PRO_PRICE_ID");
		const successUrl =
			this.configService.get<string>("STRIPE_SUCCESS_URL") ||
			"http://localhost:5173/settings?section=billing&success=1";
		const cancelUrl =
			this.configService.get<string>("STRIPE_CANCEL_URL") ||
			"http://localhost:5173/settings?section=billing";

		if (!priceId) {
			throw new BadRequestException("STRIPE_PRO_PRICE_ID is not configured");
		}

		try {
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				line_items: [
					{
						price: priceId,
						quantity: 1,
					},
				],
				mode: "subscription",
				customer_email: email,
				client_reference_id: userId,
				metadata: {
					userId,
				},
				success_url: successUrl,
				cancel_url: cancelUrl,
			});

			if (!session.url) {
				throw new BadRequestException(
					"Failed to create stripe checkout session url",
				);
			}

			return { url: session.url };
		} catch (error: any) {
			throw new BadRequestException(
				`Stripe Checkout Session error: ${error.message}`,
			);
		}
	}

	async createCustomerPortalSession(
		stripeCustomerId: string,
	): Promise<{ url: string }> {
		const stripe = this.getStripeInstance();
		const cancelUrl =
			this.configService.get<string>("STRIPE_CANCEL_URL") ||
			"http://localhost:5173/settings?section=billing";

		try {
			const session = await stripe.billingPortal.sessions.create({
				customer: stripeCustomerId,
				return_url: cancelUrl,
			});

			return { url: session.url };
		} catch (error: any) {
			throw new BadRequestException(
				`Stripe Billing Portal error: ${error.message}`,
			);
		}
	}

	constructEvent(rawBody: string | Buffer, signature: string): any {
		const stripe = this.getStripeInstance();
		const webhookSecret = this.configService.get<string>(
			"STRIPE_WEBHOOK_SECRET",
		);
		if (!webhookSecret) {
			throw new BadRequestException("STRIPE_WEBHOOK_SECRET is not configured");
		}

		try {
			return stripe.webhooks.constructEvent(
				rawBody,
				signature,
				webhookSecret,
			);
		} catch (error: any) {
			throw new BadRequestException(
				`Webhook signature verification failed: ${error.message}`,
			);
		}
	}

	async retrieveSubscription(subscriptionId: string): Promise<any> {
		const stripe = this.getStripeInstance();
		return stripe.subscriptions.retrieve(subscriptionId);
	}
}
