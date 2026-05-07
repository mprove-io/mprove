import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendClearCachedColumnRequestDto,
  ToBackendClearCachedColumnResponseDto
} from '#backend/controllers/cached-columns/clear-cached-column/clear-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { CachedColumnService } from '#backend/services/db/cached-column.service';
import { EnvsService } from '#backend/services/db/envs.service.js';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { HashService } from '#backend/services/hash.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendClearCachedColumnResponse } from '#common/zod/to-backend/connections/to-backend-clear-cached-column';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ClearCachedColumnController {
  constructor(
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private hashService: HashService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendClearCachedColumn)
  @ApiOperation({
    summary: 'ClearCachedColumn',
    description: 'Clear cached column'
  })
  @ApiOkResponse({ type: ToBackendClearCachedColumnResponseDto })
  async clearCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendClearCachedColumnRequestDto
  ): Promise<ToBackendClearCachedColumnResponse['payload']> {
    let { projectId, envId, connectionId, schemaName, tableName, columnName } =
      body.payload;

    await this.projectsService.getProjectCheckExists({ projectId: projectId });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let cacheEnvId = await this.cachedColumnService.getCacheEnvId({
      projectId: projectId,
      envId: envId
    });

    if (cacheEnvId === PROJECT_ENV_PROD) {
      await this.membersService.getMemberCheckIsAdmin({
        memberId: user.userId,
        projectId: projectId
      });
    }

    await this.db.drizzle.transaction(async tx => {
      await tx
        .delete(cachedPartsTable)
        .where(
          and(
            eq(cachedPartsTable.projectId, projectId),
            eq(cachedPartsTable.connectionId, connectionId),
            eq(cachedPartsTable.envId, cacheEnvId),
            eq(cachedPartsTable.schemaName, schemaName),
            eq(cachedPartsTable.tableName, tableName),
            eq(cachedPartsTable.columnName, columnName)
          )
        );

      await tx.delete(cachedColumnsTable).where(
        eq(
          cachedColumnsTable.cachedColumnFullId,
          this.hashService.makeCachedColumnFullId({
            projectId: projectId,
            connectionId: connectionId,
            envId: cacheEnvId,
            schemaName: schemaName,
            tableName: tableName,
            columnName: columnName
          })
        )
      );
    });

    return {};
  }
}
