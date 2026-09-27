import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { inArray } from 'drizzle-orm';
import {
  ToBackendGetCachedColumnsRequestDto,
  ToBackendGetCachedColumnsResponseDto
} from '#backend/controllers/cached-columns/get-cached-columns/get-cached-columns.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { CachedColumnService } from '#backend/services/db/cached-column.service';
import { EnvsService } from '#backend/services/db/envs.service.js';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { CachedColumn } from '#common/zod/backend/connections/cached-column';
import type { ToBackendGetCachedColumnsOutput } from '#common/zod/backend/routes/connections/get-cached-columns/get-cached-columns-response';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetCachedColumnsController {
  constructor(
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private hashService: HashService,
    private tabService: TabService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetCachedColumns' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetCachedColumns',
    description: 'Get cached columns'
  })
  @ApiOkResponse({ type: ToBackendGetCachedColumnsResponseDto })
  async getCachedColumns(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetCachedColumnsRequestDto
  ) {
    let { projectId, envId, columns } = body.input;

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

    let cachedColumns: CachedColumn[] = [];

    if (columns.length > 0) {
      let cachedColumnFullIds = columns.map(column =>
        this.hashService.makeCachedColumnFullId({
          projectId: projectId,
          connectionId: column.connectionId,
          envId: cacheEnvId,
          schemaName: column.schemaName,
          tableName: column.tableName,
          columnName: column.columnName
        })
      );

      cachedColumns = await this.db.drizzle.query.cachedColumnsTable
        .findMany({
          where: inArray(
            cachedColumnsTable.cachedColumnFullId,
            cachedColumnFullIds
          )
        })
        .then(xs => xs.map(x => this.tabService.cachedColumnEntToTab(x)))
        .then(xs =>
          xs.map(x =>
            this.cachedColumnService.cachedColumnTabToApi({ cachedColumn: x })
          )
        );
    }

    let payload: ToBackendGetCachedColumnsOutput = {
      cachedColumns: cachedColumns
    };

    return payload;
  }
}
