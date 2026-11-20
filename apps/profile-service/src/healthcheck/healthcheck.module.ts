import { Module } from '@nestjs/common';
import { HealthHttpController } from './healthcheck.controller';

@Module({
  controllers: [HealthHttpController],
  providers: [],
  imports: [],
})
export class HealthCheckModule {}
