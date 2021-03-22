import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestApplicationOptions } from '@nestjs/common';
const fs = require("fs")

let options: NestApplicationOptions = {}

if (process.env.CONTEXT === 'remote') {
  options.httpsOptions = {
    key: fs.readFileSync("src/certs/key.pem"),
    cert: fs.readFileSync("src/certs/pub.pem")
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, options);
  app.enableCors({origin: '*'});
  await app.listen(2053);
}
bootstrap();
