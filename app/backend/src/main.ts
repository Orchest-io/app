import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	//api docs
	const config = new DocumentBuilder()
		.setTitle("Orchest docs")
		.setVersion("1.0")
		.build();

	const document = SwaggerModule.createDocument(app, config);
	const OpenApiSpecification =
		/* … */
		app.use(
			"/reference",
			apiReference({
				content: document,
			}),
		);

	// CORS configuration for credentials support
	app.enableCors({
		origin: [
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:5174",
			"http://localhost:5175",
		], // Frontend origins
		credentials: true, // Allow credentials (cookies, authorization headers)
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Accept"],
		exposedHeaders: ["Authorization"],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	});

	app.setGlobalPrefix("api/v1");
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	);

	const port = process.env.PORT || 3000;
	await app.listen(port);
	console.log(`Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
