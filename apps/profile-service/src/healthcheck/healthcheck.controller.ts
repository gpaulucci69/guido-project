import { Controller, Get, Header} from '@nestjs/common';
import { healthResponse } from '../../../../packages/observability/src/health-controller';

@Controller()
export class HealthHttpController {
  @Get(["healthz", "livez", "readyz"])
  @Header("cache-control", "no-store")
  health() {
    return healthResponse("profile-service");
  }
}
