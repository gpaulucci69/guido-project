import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', loginDto.email);
    params.append('password', loginDto.password);

    return this.requestToken(params);
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshTokenDto.refresh_token);

    return this.requestToken(params);
  }

  private async requestToken(params: URLSearchParams) {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');

    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

    params.append('client_id', clientId!);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      // Keycloak devuelve un nuevo access_token y, si está configurado, un nuevo refresh_token
      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token,
        token_type: response.data.token_type,
      };
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        throw new UnauthorizedException(
          error.response?.data?.error_description || 'Token inválido o expirado',
        );
      }
      throw new InternalServerErrorException('Error al conectar con el servidor de identidad');
    }
  }

  async logout(refreshTokenDto: RefreshTokenDto) {
    const keycloakUrl = this.configService.get<string>('KEYCLOAK_URL');
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');

    const logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`;

    const params = new URLSearchParams();
    params.append('client_id', clientId!);
    params.append('refresh_token', refreshTokenDto.refresh_token);

    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }

    try {
      // Keycloak responde con status 204 No Content si la sesión se cerró correctamente
      await firstValueFrom(
        this.httpService.post(logoutUrl, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      return { message: 'Sesión cerrada correctamente' };
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        throw new UnauthorizedException(
          error.response?.data?.error_description || 'Refresh token inválido o sesión ya cerrada',
        );
      }
      throw new InternalServerErrorException('Error al cerrar sesión en el servidor de identidad');
    }
  }
}