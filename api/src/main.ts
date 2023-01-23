import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestApplicationOptions } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
const cors = require("cors");
const fs = require("fs");

let options: NestApplicationOptions = {};

options.cors = true;

async function bootstrap() {
	const app = await NestFactory.create(AppModule, options);

	const config = new DocumentBuilder()
		.setTitle("Rocketswap API Documentation")
		.setDescription("Details of the Rocketswap REST API. Further documentation can be found @ https://rocketswap.exchange/docs/")
		.setVersion("1.0")
		.build();
	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup("api_docs", app, document);

	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", "rocketswap.exchange");
		res.header("Access-Control-Allow-Origin", "https://stagingv2.rocketswap.exchange");
		res.header("Access-Control-Allow-Origin", "*.rocketswap.exchange:2053");
		res.header("Access-Control-Allow-Origin", "rswp.io");
		res.header("Access-Control-Allow-Origin", "lamden.io");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	// app.use(cors())

	// app.enableCors({ origin: "https://stagingv2.rocketswap.exchange" });
	await app.listen(2053);
}
bootstrap();


