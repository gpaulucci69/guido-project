import { randomUUID } from "node:crypto";
import { Module } from "@nestjs/common";
import { ClientContextController } from "./client-context/client-context.controller.js";
import { ClientContextService } from "./client-context/client-context.service.js";
import { PeopleController } from "./people/people.controller.js";
import { PeopleService } from "./people/people.service.js";
import { KeycloakAdminAdapter } from "./people/keycloak-admin.adapter.js";
import { MinioAvatarStorage } from "./profile/avatar-storage.adapter.js";
import { HttpKeycloakProfileAdapter } from "./profile/keycloak-profile.adapter.js";
import { ProfileController } from "./profile/profile.controller.js";
import { ProfileService } from "./profile/profile.service.js";
import {
  ProfileHttpController,
  ProfileAuthGuard,
} from "./profile-http.js";
import { HealthCheckModule } from "./healthcheck/healthcheck.module.js";

@Module({
  controllers: [ProfileHttpController],
  imports: [HealthCheckModule],
  providers: [
    ProfileAuthGuard,
    { provide: MinioAvatarStorage, useFactory: () => new MinioAvatarStorage() },
    {
      provide: ProfileController,
      inject: [MinioAvatarStorage],
      useFactory: (storage: MinioAvatarStorage) =>
        new ProfileController(
          new ProfileService(
            new HttpKeycloakProfileAdapter(),
            storage,
            (event, context) =>
              console.info(
                JSON.stringify({ event, traceId: randomUUID(), ...context }),
              ),
          ),
        ),
    },
    {
      provide: ClientContextController,
      useFactory: () => new ClientContextController(new ClientContextService()),
    },
    {
      provide: PeopleController,
      inject: [MinioAvatarStorage],
      useFactory: (storage: MinioAvatarStorage) => new PeopleController(new PeopleService(new KeycloakAdminAdapter(), storage)),
    },
  ],
})
export class AppModule {}
