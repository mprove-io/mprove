import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { checkAccess } from '~backend/functions/check-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetModelRequest,
  ToBackendGetModelResponsePayload
} from '~common/interfaces/to-backend/models/to-backend-get-model';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetModelController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private structsService: StructsService,
    private modelsService: ModelsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapEnxToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetModel)
  async getModel(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetModelRequest = request.body;

    let { projectId, isRepoProd, branchId, modelId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: modelId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendGetModelResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: apiMember,
      model: this.wrapToApiService.wrapEnxToApiModel({
        model: model,
        hasAccess: checkAccess({
          userAlias: user.alias,
          member: userMember,
          entity: model
        })
      })
    };

    return payload;
  }
}
