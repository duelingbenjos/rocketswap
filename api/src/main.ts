import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestApplicationOptions } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
const fs = require("fs");

let options: NestApplicationOptions = {};

let key, cert

// try {
// 	key = fs.readFileSync("src/certs/key.pem")
// 	cert = fs.readFileSync("src/certs/pub.pem")
// } catch (err) {
// 	console.log(err)
// }

// if (key && cert) {
// 	options.httpsOptions = {
// 		key,
// 		cert
// 	};
// }

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
		res.header("Access-Control-Allow-Origin", "rocketswap.exchange"); // update to match the domain you will make the request from
		res.header("Access-Control-Allow-Origin", "rswp.io"); // update to match the domain you will make the request from
		res.header("Access-Control-Allow-Origin", "lamden.io"); // update to match the domain you will make the request from
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	app.enableCors({ origin: "*" });
	await app.listen(2053);
}
bootstrap();
