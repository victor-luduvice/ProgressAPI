import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // garante que o DATABASE_URL do .env esteja disponível (Node 22+)
  try {
    process.loadEnvFile('.env');
  } catch {
    // sem .env: usa as variáveis do ambiente
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors(); // necessário para o PWA (outra porta) chamar a API
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
}
bootstrap();
