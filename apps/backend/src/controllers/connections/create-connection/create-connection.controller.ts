import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ConnectionsService } from '~backend/services/connections.service';
import { EnvsService } from '~backend/services/envs.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { getMotherduckDatabaseWrongChars } from '~common/functions/check-motherduck-database-name';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendCreateConnectionRequest,
  ToBackendCreateConnectionResponsePayload
} from '~common/interfaces/to-backend/connections/to-backend-create-connection';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private makerService: MakerService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateConnection)
  async createConnection(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCreateConnectionRequest = request.body;
    let {
      projectId,
      envId,
      connectionId,
      type,
      bigqueryOptions,
      clickhouseOptions,
      motherduckOptions,
      postgresOptions,
      mysqlOptions,
      snowflakeOptions,
      storeApiOptions,
      storeGoogleApiOptions
    } = reqValid.payload;

    if (isDefined(motherduckOptions)) {
      let wrongChars: string[] = getMotherduckDatabaseWrongChars({
        databaseName: motherduckOptions.database
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

    await this.connectionsService.checkConnectionDoesNotExist({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let newConnection = this.makerService.makeConnection({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      type: type,
      bigqueryOptions: bigqueryOptions,
      clickhouseOptions: clickhouseOptions,
      motherduckOptions: motherduckOptions,
      postgresOptions: postgresOptions,
      mysqlOptions: mysqlOptions,
      snowflakeOptions: snowflakeOptions,
      storeApiOptions: storeApiOptions,
      storeGoogleApiOptions: storeGoogleApiOptions
    });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, projectId),
        eq(bridgesTable.envId, envId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      x.needValidate = true;
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                connections: [newConnection]
              },
              insertOrUpdate: {
                bridges: [...branchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendCreateConnectionResponsePayload = {
      connection: this.wrapToApiService.wrapToApiConnection({
        connection: newConnection,
        isIncludePasswords: false
      })
    };

    return payload;
  }
}
