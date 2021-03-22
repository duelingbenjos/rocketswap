import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import fs from 'fs'
import { NestApplicationOptions } from '@nestjs/common';

let options: NestApplicationOptions = {}

options.httpsOptions = process.env.CONTEXT === 'remote' ? 	{
  key: fs.readFileSync("src/certs/key.pem"),
  cert: fs.readFileSync("src/certs/pub.pem")
} : {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, options);
  app.enableCors({origin: '*'});
  await app.listen(2053);
}
bootstrap();
