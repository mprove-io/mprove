import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { and, desc, eq } from 'drizzle-orm';
import {
  ToBackendViewCachedColumnRequestDto,
  ToBackendViewCachedColumnResponseDto
} from '#backend/controllers/cached-columns/view-cached-column/view-cached-column.dto';
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
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendViewCachedColumnResponsePayload } from '#common/zod/to-backend/connections/to-backend-view-cached-column';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendViewCachedColumn)
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
    } = body.payload;

    if (!Number.isInteger(offset) || offset < 0) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_OFFSET
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

    let payload: ToBackendViewCachedColumnResponsePayload = {
      cachedColumn: cachedColumn,
      columnNames: ['Value', 'Count'],
      rows: rows.map(row => [row.columnValue ?? '', row.count.toString()]),
      errorMessage: cachedColumn?.errorMessage
    };

    return payload;
  }
}
