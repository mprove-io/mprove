import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ConnectionsService } from '~backend/services/db/connections.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { DuckDbService } from '~backend/services/dwh/duckdb.service';
import { MysqlService } from '~backend/services/dwh/mysql.service';
import { PgService } from '~backend/services/dwh/pg.service';
import { PrestoService } from '~backend/services/dwh/presto.service';
import { TrinoService } from '~backend/services/dwh/trino.service';
import { TabService } from '~backend/services/tab.service';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { getMotherduckDatabaseWrongChars } from '~common/functions/check-motherduck-database-name';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import {
  ToBackendTestConnectionRequest,
  ToBackendTestConnectionResponsePayload
} from '~common/interfaces/to-backend/connections/to-backend-test-connection';
import { ServerError } from '~common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class TestConnectionController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private mysqlService: MysqlService,
    private pgService: PgService,
    private duckDbService: DuckDbService,
    private trinoService: TrinoService,
    private prestoService: PrestoService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendTestConnection)
  async testConnection(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendTestConnectionRequest = request.body;
    let { projectId, envId, connectionId, type, options } = reqValid.payload;

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
                : undefined;

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
