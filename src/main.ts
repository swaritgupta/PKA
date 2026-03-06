import { NestFactory } from '@nestjs/core';
import { AppModule } from './backend/app/app.module';
import * as dotenv from 'dotenv';
import session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import { connectRedis, redisClient } from './backend/utilities/RedisClient';
import {RedisStore} from 'connect-redis';

async function bootstrap() {

  dotenv.config({ path: './src/backend/.env' });
  await connectRedis();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  //Enable redis session
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    }),
  );
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

