import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ConnectionsService } from '~backend/services/connections.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendEditConnectionRequest,
  ToBackendEditConnectionResponsePayload
} from '~common/interfaces/to-backend/connections/to-backend-edit-connection';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class EditConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditConnection)
  async editConnection(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendEditConnectionRequest = request.body;
    let {
      projectId,
      envId,
      connectionId,
      isSSL,
      baseUrl,
      motherduckToken,
      serviceAccountCredentials,
      headers,
      googleAuthScopes,
      bigqueryQuerySizeLimitGb,
      account,
      warehouse,
      host,
      port,
      database,
      username,
      password
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let connection = await this.connectionsService.getConnectionCheckExists({
      projectId: projectId,
      envId: envId,
      connectionId: connectionId
    });

    connection.baseUrl = baseUrl;
    connection.headers = headers;
    connection.googleAuthScopes = googleAuthScopes;
    connection.isSsl = isSSL;
    connection.account = account;
    connection.warehouse = warehouse;
    connection.host = host;
    connection.port = port;
    connection.database = database;
    connection.username = username;
    connection.password = password;
    connection.motherduckToken = motherduckToken;
    connection.serviceAccountCredentials = serviceAccountCredentials;
    connection.googleCloudProject = serviceAccountCredentials?.project_id;
    connection.googleCloudClientEmail = serviceAccountCredentials?.client_email;
    connection.bigqueryQuerySizeLimitGb = bigqueryQuerySizeLimitGb;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                connections: [connection]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendEditConnectionResponsePayload = {
      connection: this.wrapToApiService.wrapToApiConnection(connection)
    };

    return payload;
  }
}
