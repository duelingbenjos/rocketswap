import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestApplicationOptions } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { log } from "./utils/logger";
const cors = require("cors");
const fs = require("fs");

let options: NestApplicationOptions = {};

const cors_whitelist = ['https://lamden.io', 'https://www.onlyluck.net', 'https://rocketswap.exchange', 'https://taurusnft.art', 'http://localhost', 'localhost', 'http//localhost:5002', '0.0.0.0']

var cors_options = {
	origin: function (origin, callback) {
	  if (cors_whitelist.indexOf(origin) !== -1 || !origin) {
		callback(null, true)
	  } else {
		callback(log.log(`CORS Request blocked from origin : ${origin}`))
	  }
	}
  }


async function bootstrap() {
	const app = await NestFactory.create(AppModule, options);
	const config = new DocumentBuilder()
	.setTitle("Rocketswap API Documentation")
	.setDescription("Details of the Rocketswap REST API. Further documentation can be found @ https://rocketswap.exchange/docs/")
	.setVersion("1.0")
	.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api_docs", app, document);

	app.use(cors(cors_options))
	await app.listen(2053);
}
bootstrap();
