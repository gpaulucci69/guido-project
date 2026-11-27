import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/index.js';

async function bootstrap() {
  const logger = new Logger("Kaycloak-IAM-API");
  const app = await NestFactory.create (
    AppModule, 
    { 
      logger: ['error', 'warn', 'log'], // DEV: Or set to `false` to disable all logs
    }
/*  FOR PROD: machine-readable JSON over colorized terminal text  
    {
      logger: new ConsoleLogger({
      json: true,
    }
*/
  );
  app.enableCors({
    origin: "*",
    allowedHeaders: ["authorization", "content-type"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(envs.port ?? 3000);
  logger.log(`Keycloak IAM API running on port ${envs.port ?? 3000}`);
}
await bootstrap();
