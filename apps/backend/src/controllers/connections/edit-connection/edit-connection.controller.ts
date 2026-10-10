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
  ToBackendEditConnectionRequestDto,
  ToBackendEditConnectionResponseDto
} from '#backend/controllers/connections/edit-connection/edit-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { UrlService } from '#backend/services/url/url.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import {
  DEFAULT_QUERY_SIZE_LIMIT,
  THROTTLE_CUSTOM
} from '#common/constants/top-backend';
import { getMotherduckDatabaseWrongChars } from '#common/functions/get-motherduck-database-wrong-chars/get-motherduck-database-wrong-chars';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetConnectionCheckExistsResultError } from '#common/types/backend/function-errors/get-connection-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditConnectionOutput } from '#common/types/backend/routes/connections/edit-connection/edit-connection-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private urlService: UrlService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
          ? this.urlService.checkApiUrlResult({
              urlStr: v.options.storeApi.baseUrl
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isDefined(v.options.storeGoogleApi)
          ? this.urlService.checkApiUrlResult({
              urlStr: v.options.storeApi.baseUrl
            })
          : Result.succeed()
      ),
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
        'connection',
        (
          v
        ): Result.ResultAsync<
          ConnectionTab,
          GetConnectionCheckExistsResultError
        > =>
          this.connectionsService.getConnectionCheckExistsResult({
            projectId: v.projectId,
            envId: v.envId,
            connectionId: v.connectionId
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
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        connections: [v.connection],
                        bridges: [...v.branchBridgeEnts]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
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
