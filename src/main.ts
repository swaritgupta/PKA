import { NestFactory } from '@nestjs/core';
import { AppModule } from './backend/app/app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {

  dotenv.config({ path: './src/backend/.env' });

  const app = await NestFactory.create(AppModule);

   // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('');

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '127.0.0.1';
  await app.listen(Number(PORT), HOST);
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📚 Personal Knowledge Assistant is initialized`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});

