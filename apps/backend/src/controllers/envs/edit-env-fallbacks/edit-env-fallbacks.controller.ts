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
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendEditEnvFallbacksRequest,
  ToBackendEditEnvFallbacksResponsePayload
} from '~common/interfaces/to-backend/envs/to-backend-edit-env-fallbacks';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class EditEnvFallbacksController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditEnvFallbacks)
  async editEnvFallbacks(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendEditEnvFallbacksRequest = request.body;

    let {
      projectId,
      envId,
      isFallbackToProdConnections,
      isFallbackToProdVariables
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<BackendConfig['firstProjectId']>('firstProjectId');

    if (userMember.isAdmin === false && projectId === firstProjectId) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
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
        member: userMember
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

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let payload: ToBackendEditEnvFallbacksResponsePayload = {
      userMember: this.wrapToApiService.wrapToApiMember(userMember),
      envs: apiEnvs
    };

    return payload;
  }
}
