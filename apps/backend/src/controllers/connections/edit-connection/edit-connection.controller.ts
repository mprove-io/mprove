import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendEditConnectionRequestDto,
  ToBackendEditConnectionResponseDto
} from '#backend/controllers/connections/edit-connection/edit-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BridgeTab,
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { UrlService } from '#backend/services/url/url.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import {
  DEFAULT_QUERY_SIZE_LIMIT,
  THROTTLE_CUSTOM
} from '#common/constants/top-backend';
import { getMotherduckDatabaseWrongChars } from '#common/functions/get-motherduck-database-wrong-chars/get-motherduck-database-wrong-chars';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { GetConnectionCheckExistsError } from '#common/types/backend/function-errors/get-connection-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditConnectionOutput } from '#common/types/backend/routes/connections/edit-connection/edit-connection-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditConnectionController {
  constructor(
    private urlService: UrlService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendEditConnection' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditConnection',
    description: 'Update options of an existing connection'
  })
  @ApiOkResponse({
    type: ToBackendEditConnectionResponseDto
  })
  async editConnection(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditConnectionRequestDto
  ): Promise<BackendResultForOperation<'editConnection'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        connectionId: body.input.connectionId,
        options: body.input.options,
        userId: user.userId
      }),
      Result.andThrough(v =>
        isDefined(v.options.storeApi)
          ? this.urlService.checkApiUrl({
              urlStr: v.options.storeApi.baseUrl
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isDefined(v.options.storeGoogleApi)
          ? this.urlService.checkApiUrl({
              urlStr: v.options.storeApi.baseUrl
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'connection',
        (v): Result.ResultAsync<ConnectionTab, GetConnectionCheckExistsError> =>
          this.db.connections.findFirstCheckExists({
            where: and(
              eq(connectionsTable.connectionId, v.connectionId),
              eq(connectionsTable.envId, v.envId),
              eq(connectionsTable.projectId, v.projectId)
            )
          })
      ),
      Result.map(v => {
        if (isDefined(v.options.storeGoogleApi)) {
          v.options.storeGoogleApi.googleCloudProject =
            v.options.storeGoogleApi.serviceAccountCredentials?.project_id;

          v.options.storeGoogleApi.googleCloudClientEmail =
            v.options.storeGoogleApi.serviceAccountCredentials?.client_email;
        }

        if (isDefined(v.options.bigquery)) {
          v.options.bigquery.googleCloudProject =
            v.options.bigquery.serviceAccountCredentials?.project_id;

          v.options.bigquery.googleCloudClientEmail =
            v.options.bigquery.serviceAccountCredentials?.client_email;

          let sLimit = v.options.bigquery.bigqueryQuerySizeLimitGb;

          v.options.bigquery.bigqueryQuerySizeLimitGb =
            isDefined(sLimit) && sLimit > 0 ? sLimit : DEFAULT_QUERY_SIZE_LIMIT;
        }

        return v;
      }),
      Result.andThrough(v => {
        if (isUndefined(v.options.motherduck)) {
          return Result.succeed();
        }

        let wrongChars: string[] = getMotherduckDatabaseWrongChars({
          databaseName: v.options.motherduck.database
        });

        return wrongChars?.length > 0
          ? Result.fail({
              code: 'BACKEND_WRONG_MOTHERDUCK_DATABASE_CHARACTERS'
            })
          : Result.succeed();
      }),
      Result.map(v => {
        this.connectionsService.cleanInternalFields({ options: v.options });

        v.connection.options = v.options;

        return v;
      }),
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], BridgeEntToTabError> =>
          this.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.projectId),
              eq(bridgesTable.envId, v.envId)
            )
          })
      ),
      Result.map(v => {
        v.branchBridges.forEach(bridge => {
          bridge.needValidate = true;
        });
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            connections: [v.connection],
            bridges: [...v.branchBridges]
          }
        })
      ),
      Result.map(
        (v): ToBackendEditConnectionOutput => ({
          connection: this.connectionsService.tabToApiProjectConnection({
            connection: v.connection,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
