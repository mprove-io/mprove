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
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/_index';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class EditEnvFallbacksController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditEnvFallbacks)
  async editEnvFallbacks(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendEditEnvFallbacksRequest = request.body;

    let {
      projectId,
      envId,
      isFallbackToProdConnections,
      isFallbackToProdVariables
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (member.isAdmin === false && projectId === firstProjectId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    env.isFallbackToProdConnections = isFallbackToProdConnections;
    env.isFallbackToProdVariables = isFallbackToProdVariables;

    let prodEnv;

    if (
      env.isFallbackToProdConnections === true ||
      env.isFallbackToProdVariables === true
    ) {
      prodEnv = await this.envsService.getEnvCheckExistsAndAccess({
        projectId: projectId,
        envId: PROJECT_ENV_PROD,
        member: member
      });
    }

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
        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              bridges: [...branchBridges],
              envs: [env]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let connections = await this.db.drizzle.query.connectionsTable.findMany({
      where: and(
        eq(connectionsTable.projectId, projectId),
        inArray(
          connectionsTable.envId,
          env.isFallbackToProdConnections === true
            ? [env.envId, PROJECT_ENV_PROD]
            : [env.envId]
        )
      )
    });

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.projectId, projectId)
    });

    let envConnectionIds = connections
      .filter(x => x.envId === env.envId)
      .map(connection => connection.connectionId);

    let payload: apiToBackend.ToBackendEditEnvFallbacksResponsePayload = {
      env: this.wrapToApiService.wrapToApiEnv({
        env: env,
        envConnectionIds: envConnectionIds,
        fallbackConnectionIds:
          env.isFallbackToProdConnections === true
            ? connections
                .filter(
                  y =>
                    y.envId === PROJECT_ENV_PROD &&
                    envConnectionIds.indexOf(y.connectionId) < 0
                )
                .map(connection => connection.connectionId)
            : [],
        fallbackEvs:
          env.isFallbackToProdVariables === true
            ? prodEnv.evs.filter(
                y => env.evs.map(ev => ev.evId).indexOf(y.evId) < 0
              )
            : [],
        envMembers:
          env.envId === common.PROJECT_ENV_PROD
            ? []
            : members.filter(m => env.memberIds.indexOf(m.memberId) > -1)
      })
    };

    return payload;
  }
}
