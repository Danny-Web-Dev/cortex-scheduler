import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export const API_PREFIX = 'api';
const DEFAULT_PORT = 3000;

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(API_PREFIX);
  await app.listen(DEFAULT_PORT);
};

void bootstrap();
