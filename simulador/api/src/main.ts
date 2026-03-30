import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ 
      logger: true 
    }),
  );

  
  

  // Configuração de CORS para permitir o Front-end
  app.enableCors({
    origin: ['http://localhost:3000'], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT ?? 4000;
  
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Novely API is running on: http://localhost:${port}`);
}

bootstrap();