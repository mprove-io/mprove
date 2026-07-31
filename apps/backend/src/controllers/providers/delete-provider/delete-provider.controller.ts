import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteProviderRequestDto,
  ToBackendDeleteProviderResponseDto
} from '#backend/controllers/providers/delete-provider/delete-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendDeleteProviderResponsePayload } from '#common/zod/to-backend/providers/to-backend-delete-provider';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteProviderController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteProvider)
  @ApiOperation({
    summary: 'DeleteProvider',
    description: 'Delete a provider from a project'
  })
  @ApiOkResponse({
    type: ToBackendDeleteProviderResponseDto
  })
  async deleteProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteProviderRequestDto
  ) {
    let { projectId, providerId } = body.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(providersTable)
            .where(
              and(
                eq(providersTable.projectId, projectId),
                eq(providersTable.providerId, providerId)
              )
            );
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendDeleteProviderResponsePayload = {};

    return payload;
  }
}
