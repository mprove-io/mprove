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

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ConnectionsService } from '~backend/services/connections.service';
import { EnvsService } from '~backend/services/envs.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

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

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateConnection)
  async createConnection(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendCreateConnectionRequest = request.body;
    let {
      projectId,
      envId,
      connectionId,
      type,
      isSSL,
      baseUrl,
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
      baseUrl: baseUrl,
      headers: headers,
      googleAuthScopes: googleAuthScopes,
      account: account,
      warehouse: warehouse,
      host: host,
      port: port,
      database: database,
      username: username,
      password: password,
      serviceAccountCredentials: serviceAccountCredentials,
      bigqueryQuerySizeLimitGb: bigqueryQuerySizeLimitGb,
      isSSL: isSSL
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

    let payload: apiToBackend.ToBackendCreateConnectionResponsePayload = {
      connection: this.wrapToApiService.wrapToApiConnection(newConnection)
    };

    return payload;
  }
}
