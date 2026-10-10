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
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteConnectionRequestDto,
  ToBackendDeleteConnectionResponseDto
} from '#backend/controllers/connections/delete-connection/delete-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteConnectionOutput } from '#common/types/backend/routes/connections/delete-connection/delete-connection-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteConnection' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteConnection',
    description: 'Delete a connection from a project environment'
  })
  @ApiOkResponse({
    type: ToBackendDeleteConnectionResponseDto
  })
  async deleteConnection(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteConnectionRequestDto
  ): Promise<BackendResultForOperation<'deleteConnection'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        connectionId: body.input.connectionId,
        envId: body.input.envId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdminResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'branchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.projectId),
                eq(bridgesTable.envId, v.envId)
              )
            })
            .then(bridgeEnts => Result.succeed(bridgeEnts))
      ),
      Result.map(v => {
        v.branchBridgeEnts.forEach(bridgeEnt => {
          bridgeEnt.needValidate = true;
        });
        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(async tx => {
                  await tx
                    .delete(connectionsTable)
                    .where(
                      and(
                        eq(connectionsTable.projectId, v.projectId),
                        eq(connectionsTable.envId, v.envId),
                        eq(connectionsTable.connectionId, v.connectionId)
                      )
                    );

                  await tx
                    .delete(cachedPartsTable)
                    .where(
                      and(
                        eq(cachedPartsTable.projectId, v.projectId),
                        eq(cachedPartsTable.envId, v.envId),
                        eq(cachedPartsTable.connectionId, v.connectionId)
                      )
                    );

                  await tx
                    .delete(cachedColumnsTable)
                    .where(
                      and(
                        eq(cachedColumnsTable.projectId, v.projectId),
                        eq(cachedColumnsTable.envId, v.envId),
                        eq(cachedColumnsTable.connectionId, v.connectionId)
                      )
                    );

                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      bridges: [...v.branchBridgeEnts]
                    }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map((v): ToBackendDeleteConnectionOutput => ({}))
    );
  }
}
