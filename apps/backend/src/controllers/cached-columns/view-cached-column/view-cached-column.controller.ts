import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { and, desc, eq } from 'drizzle-orm';
import {
  ToBackendViewCachedColumnRequestDto,
  ToBackendViewCachedColumnResponseDto
} from '#backend/controllers/cached-columns/view-cached-column/view-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CachedColumnService } from '#backend/services/db/cached-column/cached-column.service';
import { EnvsService } from '#backend/services/db/envs/envs.service.js';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendViewCachedColumnOutput } from '#common/types/backend/routes/connections/view-cached-column/view-cached-column-output';

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ViewCachedColumnController {
  constructor(
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private hashService: HashService,
    private tabService: TabService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendViewCachedColumn' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ViewCachedColumn',
    description: 'View cached column'
  })
  @ApiOkResponse({ type: ToBackendViewCachedColumnResponseDto })
  async viewCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendViewCachedColumnRequestDto
  ) {
    let {
      projectId,
      envId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      offset
    } = body.input;

    if (!Number.isInteger(offset) || offset < 0) {
      throw new ServerError({
        message: 'BACKEND_WRONG_OFFSET'
      });
    }

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

    let rows = await this.db.drizzle.query.cachedPartsTable
      .findMany({
        where: and(
          eq(cachedPartsTable.projectId, projectId),
          eq(cachedPartsTable.connectionId, connectionId),
          eq(cachedPartsTable.envId, cacheEnvId),
          eq(cachedPartsTable.schemaNameLc, schemaName.toLowerCase()),
          eq(cachedPartsTable.tableNameLc, tableName.toLowerCase()),
          eq(cachedPartsTable.columnNameLc, columnName.toLowerCase())
        ),
        orderBy: desc(cachedPartsTable.count),
        limit: 100,
        offset: offset
      })
      .then(xs => xs.map(x => this.tabService.cachedPartEntToTab(x)));

    let cachedColumn = await this.db.drizzle.query.cachedColumnsTable
      .findFirst({
        where: eq(
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
      })
      .then(x => this.tabService.cachedColumnEntToTab(x))
      .then(x => {
        if (isUndefined(x)) {
          return;
        }

        return this.cachedColumnService.cachedColumnTabToApi({
          cachedColumn: x
        });
      });

    let payload: ToBackendViewCachedColumnOutput = {
      cachedColumn: cachedColumn,
      columnNames: ['Value', 'Count'],
      rows: rows.map(row => [row.columnValue ?? '', row.count.toString()]),
      errorMessage: cachedColumn?.errorMessage
    };

    return payload;
  }
}
