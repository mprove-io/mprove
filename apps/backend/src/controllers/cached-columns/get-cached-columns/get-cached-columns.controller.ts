import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { inArray } from 'drizzle-orm';
import {
  ToBackendGetCachedColumnsRequestDto,
  ToBackendGetCachedColumnsResponseDto
} from '#backend/controllers/cached-columns/get-cached-columns/get-cached-columns.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { CachedColumnService } from '#backend/services/db/cached-column.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { CachedColumn } from '#common/zod/to-backend/connections/cached-column';
import type { ToBackendGetCachedColumnsResponsePayload } from '#common/zod/to-backend/connections/to-backend-get-cached-columns';

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
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetCachedColumns)
  @ApiOperation({
    summary: 'GetCachedColumns',
    description: 'Get cached columns'
  })
  @ApiOkResponse({ type: ToBackendGetCachedColumnsResponseDto })
  async getCachedColumns(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetCachedColumnsRequestDto
  ) {
    let { projectId, envId, columns } = body.payload;

    let cacheEnvId = await this.cachedColumnService.getCacheEnvId({
      projectId: projectId,
      envId: envId
    });

    await this.projectsService.getProjectCheckExists({ projectId: projectId });

    await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
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

    let payload: ToBackendGetCachedColumnsResponsePayload = {
      cachedColumns: cachedColumns
    };

    return payload;
  }
}
