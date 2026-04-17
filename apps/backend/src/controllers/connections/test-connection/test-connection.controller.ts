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
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendTestConnectionRequestDto,
  ToBackendTestConnectionResponseDto
} from '#backend/controllers/connections/test-connection/test-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ConnectionsService } from '#backend/services/db/connections.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { BigQueryService } from '#backend/services/dwh/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql.service';
import { PgService } from '#backend/services/dwh/pg.service';
import { PrestoService } from '#backend/services/dwh/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino.service';
import { StoreService } from '#backend/services/store.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { getMotherduckDatabaseWrongChars } from '#common/functions/check-motherduck-database-name';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendTestConnectionResponsePayload } from '#common/zod/to-backend/connections/to-backend-test-connection';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendTestConnection)
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
  ) {
    let { projectId, envId, connectionId, type, options, storeMethod } =
      body.payload;

    if (isDefined(options.motherduck)) {
      let wrongChars: string[] = getMotherduckDatabaseWrongChars({
        databaseName: options.motherduck.database
      });

      if (wrongChars?.length > 0) {
        throw new ServerError({
          message: ErEnum.BACKEND_WRONG_MOTHERDUCK_DATABASE_CHARACTERS
        });
      }
    }

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let testConnection = this.connectionsService.makeConnection({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      type: type,
      options: options
    });

    let testConnectionResult =
      testConnection.type === ConnectionTypeEnum.MySQL
        ? await this.mysqlService.testConnection({ connection: testConnection })
        : testConnection.type === ConnectionTypeEnum.PostgreSQL
          ? await this.pgService.testConnection({ connection: testConnection })
          : testConnection.type === ConnectionTypeEnum.MotherDuck
            ? await this.duckDbService.testConnection({
                connection: testConnection
              })
            : testConnection.type === ConnectionTypeEnum.Trino
              ? await this.trinoService.testConnection({
                  connection: testConnection
                })
              : testConnection.type === ConnectionTypeEnum.Presto
                ? await this.prestoService.testConnection({
                    connection: testConnection
                  })
                : testConnection.type === ConnectionTypeEnum.BigQuery
                  ? await this.bigQueryService.testConnection({
                      connection: testConnection
                    })
                  : testConnection.type === ConnectionTypeEnum.SnowFlake
                    ? await this.snowFlakeService.testConnection({
                        connection: testConnection
                      })
                    : testConnection.type === ConnectionTypeEnum.Databricks
                      ? await this.databricksService.testConnection({
                          connection: testConnection
                        })
                      : undefined;
    // testConnection.type === ConnectionTypeEnum.Api ||
    //     testConnection.type === ConnectionTypeEnum.GoogleApi
    //   ? await this.storeService.testConnection({
    //       connection: testConnection,
    //       storeMethod: storeMethod
    //     })
    //   : undefined;

    if (isUndefined(testConnectionResult)) {
      throw new ServerError({
        message: ErEnum.BACKEND_TEST_CONNECTION_RESULT_IS_NOT_DEFINED
      });
    }

    let payload: ToBackendTestConnectionResponsePayload = {
      testConnectionResult: testConnectionResult
    };

    return payload;
  }
}
