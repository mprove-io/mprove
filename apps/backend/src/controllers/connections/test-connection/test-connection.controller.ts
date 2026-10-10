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
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendTestConnectionRequestDto,
  ToBackendTestConnectionResponseDto
} from '#backend/controllers/connections/test-connection/test-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { BigQueryService } from '#backend/services/dwh/bigquery/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql/mysql.service';
import { PgService } from '#backend/services/dwh/pg/pg.service';
import { PrestoService } from '#backend/services/dwh/presto/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino/trino.service';
import { StoreService } from '#backend/services/store/store.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { getMotherduckDatabaseWrongChars } from '#common/functions/get-motherduck-database-wrong-chars/get-motherduck-database-wrong-chars';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { TestConnectionResult } from '#common/types/backend/parts/connections/test-connection-result';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendTestConnectionOutput } from '#common/types/backend/routes/connections/test-connection/test-connection-output';

@ApiTags('Connections')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class TestConnectionController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private mysqlService: MysqlService,
    private pgService: PgService,
    private databricksService: DatabricksService,
    private duckDbService: DuckDbService,
    private trinoService: TrinoService,
    private prestoService: PrestoService,
    private bigQueryService: BigQueryService,
    private snowFlakeService: SnowFlakeService,
    private storeService: StoreService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendTestConnection' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'TestConnection',
    description: 'Verify that a SQL connection can be established'
  })
  @ApiOkResponse({
    type: ToBackendTestConnectionResponseDto
  })
  async testConnection(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendTestConnectionRequestDto
  ): Promise<BackendResultForOperation<'testConnection'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        connectionId: body.input.connectionId,
        type: body.input.type,
        options: body.input.options,
        userId: user.userId
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
      Result.andThrough(v =>
        this.membersService.getMemberCheckExistsResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'connection',
        (v): Result.Result<ConnectionTab, never> =>
          Result.succeed(
            this.connectionsService.makeConnection({
              projectId: v.projectId,
              envId: v.envId,
              connectionId: v.connectionId,
              type: v.type,
              options: v.options
            })
          )
      ),
      Result.bind(
        'testConnectionResult',
        async (v): Result.ResultAsync<TestConnectionResult, never> => {
          let testConnectionResult: TestConnectionResult =
            v.connection.type === 'MySQL'
              ? await this.mysqlService.testConnection({
                  connection: v.connection
                })
              : v.connection.type === 'PostgreSQL'
                ? await this.pgService.testConnection({
                    connection: v.connection
                  })
                : v.connection.type === 'MotherDuck'
                  ? await this.duckDbService.testConnection({
                      connection: v.connection
                    })
                  : v.connection.type === 'Trino'
                    ? await this.trinoService.testConnection({
                        connection: v.connection
                      })
                    : v.connection.type === 'Presto'
                      ? await this.prestoService.testConnection({
                          connection: v.connection
                        })
                      : v.connection.type === 'BigQuery'
                        ? await this.bigQueryService.testConnection({
                            connection: v.connection
                          })
                        : v.connection.type === 'SnowFlake'
                          ? await this.snowFlakeService.testConnection({
                              connection: v.connection
                            })
                          : v.connection.type === 'Databricks'
                            ? await this.databricksService.testConnection({
                                connection: v.connection
                              })
                            : undefined;
          return Result.succeed(testConnectionResult);
        }
      ),
      Result.andThrough(v =>
        isUndefined(v.testConnectionResult)
          ? Result.fail({
              code: 'BACKEND_TEST_CONNECTION_RESULT_IS_NOT_DEFINED'
            })
          : Result.succeed()
      ),
      Result.map(
        (v): ToBackendTestConnectionOutput => ({
          testConnectionResult: v.testConnectionResult
        })
      )
    );
  }
}
