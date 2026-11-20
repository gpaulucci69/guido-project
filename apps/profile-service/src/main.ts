import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module"
import { ProfileHttpFilter } from "./profile-http";
import { envs } from './config';
import { Logger } from "@nestjs/common";

async function bootstrap() {

  const logger = new Logger("Main-Gateway");

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
    allowedHeaders: ["authorization", "content-type"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  app.useGlobalFilters(new ProfileHttpFilter());
  app.setGlobalPrefix('api/v1');
  await app.listen(Number(envs.port ?? 3001), "0.0.0.0");
  logger.log(`Gateway running on port ${envs.port}`);
}

void bootstrap();
