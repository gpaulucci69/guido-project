import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule], // Importa HttpModule para comunicarte con Keycloak
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
