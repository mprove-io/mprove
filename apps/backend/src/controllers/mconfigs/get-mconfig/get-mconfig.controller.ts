import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { TabService } from '~backend/services/tab.service';
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
    private tabService: TabService,
    private mconfigsService: MconfigsService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetMconfig)
  async getMconfig(@AttachUser() user: UserTab, @Req() request: any) {
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
      mconfig: this.mconfigsService.tabToApi({
        mconfig: mconfig,
        modelFields: model.fields
      })
    };

    return payload;
  }
}
