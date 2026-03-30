import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Logger ativo apenas em desenvolvimento para não poluir logs do Render
  const isProd = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ 
      logger: !isProd 
    }),
  );

  // Pipes globais para validação automática de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS configurado para local e produção
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://simulador-ebitda.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  // O Render define a porta via variável de ambiente
  const port = process.env.PORT || 4000;
  
  // OBRIGATÓRIO: '0.0.0.0' para Fastify em containers/PaaS como Render
  await app.listen(port, '0.0.0.0');

  console.log(`
  🚀 Novely API is standing by!
  🌍 Mode: ${isProd ? 'Production' : 'Development'}
  🔗 URL: http://0.0.0.0:${port}
  `);
}

bootstrap();