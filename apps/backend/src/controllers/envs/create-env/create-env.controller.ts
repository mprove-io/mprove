import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { EMPTY_STRUCT_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendCreateEnvRequest,
  ToBackendCreateEnvResponsePayload
} from '~common/interfaces/to-backend/envs/to-backend-create-env';

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
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateEnv)
  async createEnv(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCreateEnvRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
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
        member: userMember
      });
    }

    let branches = await this.db.drizzle.query.branchesTable.findMany({
      where: eq(branchesTable.projectId, projectId)
    });

    let newBridges: BridgeEnt[] = [];

    branches.forEach(x => {
      let newBridge = this.makerService.makeBridge({
        projectId: projectId,
        repoId: x.repoId,
        branchId: x.branchId,
        envId: envId,
        structId: EMPTY_STRUCT_ID,
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

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let payload: ToBackendCreateEnvResponsePayload = {
      userMember: this.wrapToApiService.wrapToApiMember(userMember),
      envs: apiEnvs
    };

    return payload;
  }
}
