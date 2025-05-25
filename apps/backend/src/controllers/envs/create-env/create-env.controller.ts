import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/constants/top';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateEnvController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private makerService: MakerService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnv)
  async createEnv(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateEnvRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await this.envsService.checkEnvDoesNotExist({
      projectId: projectId,
      envId: envId
    });

    let newEnv = this.makerService.makeEnv({
      projectId: projectId,
      envId: envId,
      evs: []
    });

    let prodEnv;

    if (
      newEnv.isFallbackToProdConnections === true ||
      newEnv.isFallbackToProdVariables === true
    ) {
      prodEnv = await this.envsService.getEnvCheckExistsAndAccess({
        projectId: projectId,
        envId: PROJECT_ENV_PROD,
        member: member
      });
    }

    let branches = await this.db.drizzle.query.branchesTable.findMany({
      where: eq(branchesTable.projectId, projectId)
    });

    let newBridges: schemaPostgres.BridgeEnt[] = [];

    branches.forEach(x => {
      let newBridge = this.makerService.makeBridge({
        projectId: projectId,
        repoId: x.repoId,
        branchId: x.branchId,
        envId: envId,
        structId: common.EMPTY_STRUCT_ID,
        needValidate: true
      });

      newBridges.push(newBridge);
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                envs: [newEnv],
                bridges: newBridges
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let connections = await this.db.drizzle.query.connectionsTable.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        inArray(
          connectionsTable.envId,
          newEnv.isFallbackToProdConnections === true
            ? [newEnv.envId, PROJECT_ENV_PROD]
            : [newEnv.envId]
        )
      )
    });

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: and(
        eq(membersTable.projectId, projectId),
        inArray(membersTable.memberId, newEnv.memberIds)
      )
    });

    let envConnectionIds = connections
      .filter(x => x.envId === newEnv.envId)
      .map(connection => connection.connectionId);

    let fallbackConnectionIds =
      newEnv.isFallbackToProdConnections === true
        ? connections
            .filter(
              y =>
                y.envId === PROJECT_ENV_PROD &&
                envConnectionIds.indexOf(y.connectionId) < 0
            )
            .map(connection => connection.connectionId)
        : [];

    let fallbackEvs =
      newEnv.isFallbackToProdVariables === true
        ? prodEnv.evs.filter(
            y => newEnv.evs.map(ev => ev.evId).indexOf(y.evId) < 0
          )
        : [];

    let payload: apiToBackend.ToBackendCreateEnvResponsePayload = {
      env: this.wrapToApiService.wrapToApiEnv({
        env: newEnv,
        envConnectionIds: envConnectionIds,
        fallbackConnectionIds: fallbackConnectionIds,
        fallbackEvs: fallbackEvs,
        envMembers:
          newEnv.envId === common.PROJECT_ENV_PROD
            ? []
            : members.filter(m => newEnv.memberIds.indexOf(m.memberId) > -1)
      })
    };

    return payload;
  }
}
