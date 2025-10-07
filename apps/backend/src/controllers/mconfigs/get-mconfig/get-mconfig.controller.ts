import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetMconfigRequest,
  ToBackendGetMconfigResponsePayload
} from '~common/interfaces/to-backend/mconfigs/to-backend-get-mconfig';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetMconfigController {
  constructor(
    private mconfigsService: MconfigsService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapEnxToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetMconfig)
  async getMconfig(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetMconfigRequest = request.body;

    let { projectId, isRepoProd, branchId, envId, mconfigId } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.structId,
      mconfigId: mconfigId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    let payload: ToBackendGetMconfigResponsePayload = {
      mconfig: this.wrapToApiService.wrapToApiMconfig({
        mconfig: mconfig,
        modelFields: model.fields
      })
    };

    return payload;
  }
}
