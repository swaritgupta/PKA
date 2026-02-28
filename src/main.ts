import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  dotenv.config({ path: './src/backend/.env' });

   // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('');

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 Personal Knowledge Assistant is initialized`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});


