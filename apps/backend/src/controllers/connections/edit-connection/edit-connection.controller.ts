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
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ConnectionsService } from '~backend/services/connections.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import {
  DEFAULT_QUERY_SIZE_LIMIT,
  THROTTLE_CUSTOM
} from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { getMotherduckDatabaseWrongChars } from '~common/functions/check-motherduck-database-name';
import { isDefined } from '~common/functions/is-defined';
import { ConnectionTab } from '~common/interfaces/backend/connection/connection-tab';
import {
  ToBackendEditConnectionRequest,
  ToBackendEditConnectionResponsePayload
} from '~common/interfaces/to-backend/connections/to-backend-edit-connection';
import { ServerError } from '~common/models/server-error';
import { encryptData } from '~node-common/functions/encryption/encrypt-data';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
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
    let { projectId, envId, connectionId, options } = reqValid.payload;

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

    if (isDefined(options.storeGoogleApi)) {
      options.storeGoogleApi.googleCloudProject =
        options.storeGoogleApi.serviceAccountCredentials?.project_id;

      options.storeGoogleApi.googleCloudClientEmail =
        options.storeGoogleApi.serviceAccountCredentials?.client_email;
    }

    if (isDefined(options.bigquery)) {
      options.bigquery.googleCloudProject =
        options.bigquery.serviceAccountCredentials?.project_id;

      options.bigquery.googleCloudClientEmail =
        options.bigquery.serviceAccountCredentials?.client_email;

      let slimit = options.bigquery.bigqueryQuerySizeLimitGb;

      options.bigquery.bigqueryQuerySizeLimitGb =
        isDefined(slimit) && slimit > 0 ? slimit : DEFAULT_QUERY_SIZE_LIMIT;
    }

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

    let connectionTab: ConnectionTab = { options: options };

    connection.tab = encryptData({
      data: connectionTab,
      keyBase64: this.cs.get<BackendConfig['backendAesKey']>('backendAesKey')
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
              insertOrUpdate: {
                connections: [connection],
                bridges: [...branchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendEditConnectionResponsePayload = {
      connection: this.wrapToApiService.wrapToApiConnection({
        connection: connection,
        isIncludePasswords: false
      })
    };

    return payload;
  }
}
