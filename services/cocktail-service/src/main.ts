import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Préfixe global pour correspondre à l'Ingress (/cocktail/...)
  app.setGlobalPrefix('cocktail');

  const config = new DocumentBuilder()
    .setTitle('Cocktail Service')
    .setDescription('The Cocktail Service API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Swagger exposé sous /cocktail/api
  SwaggerModule.setup('cocktail/api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
