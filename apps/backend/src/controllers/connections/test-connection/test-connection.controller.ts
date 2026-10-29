import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendTestConnectionRequestDto,
  ToBackendTestConnectionResponseDto
} from '#backend/controllers/connections/test-connection/test-connection.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { makeConnection } from '#backend/functions/db/connections/make-connection/make-connection';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { testBigqueryConnection } from '#backend/functions/dwh/bigquery/test-bigquery-connection/test-bigquery-connection';
import { testDatabricksConnection } from '#backend/functions/dwh/databricks/test-databricks-connection/test-databricks-connection';
import { testDuckdbConnection } from '#backend/functions/dwh/duckdb/test-duckdb-connection/test-duckdb-connection';
import { testMysqlConnection } from '#backend/functions/dwh/mysql/test-mysql-connection/test-mysql-connection';
import { testPgConnection } from '#backend/functions/dwh/pg/test-pg-connection/test-pg-connection';
import { testPrestoConnection } from '#backend/functions/dwh/presto/test-presto-connection/test-presto-connection';
import { testSnowflakeConnection } from '#backend/functions/dwh/snowflake/test-snowflake-connection/test-snowflake-connection';
import { testTrinoConnection } from '#backend/functions/dwh/trino/test-trino-connection/test-trino-connection';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
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
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
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
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('connection', v =>
        Result.succeed(
          makeConnection({
            projectId: v.projectId,
            envId: v.envId,
            connectionId: v.connectionId,
            type: v.type,
            options: v.options
          })
        )
      ),
      Result.bind('testConnectionResult', async v => {
        let testConnectionResult: TestConnectionResult =
          v.connection.type === 'MySQL'
            ? await testMysqlConnection({
                connection: v.connection
              })
            : v.connection.type === 'PostgreSQL'
              ? await testPgConnection({
                  connection: v.connection
                })
              : v.connection.type === 'MotherDuck'
                ? await testDuckdbConnection({
                    connection: v.connection
                  })
                : v.connection.type === 'Trino'
                  ? await testTrinoConnection({
                      connection: v.connection
                    })
                  : v.connection.type === 'Presto'
                    ? await testPrestoConnection({
                        connection: v.connection
                      })
                    : v.connection.type === 'BigQuery'
                      ? await testBigqueryConnection({
                          connection: v.connection
                        })
                      : v.connection.type === 'SnowFlake'
                        ? await testSnowflakeConnection({
                            connection: v.connection
                          })
                        : v.connection.type === 'Databricks'
                          ? await testDatabricksConnection({
                              cs: this.cs,
                              logger: this.logger,
                              connection: v.connection
                            })
                          : undefined;
        return Result.succeed(testConnectionResult);
      }),
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
