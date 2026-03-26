import { Injectable } from '@nestjs/common';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import type { Member } from '#common/interfaces/backend/member';
import type { ModelX } from '#common/interfaces/backend/model-x';
import type { StructX } from '#common/interfaces/backend/struct-x';
import { ToBackendGetModelResponsePayload } from '#common/interfaces/to-backend/models/to-backend-get-model';

@Injectable()
export class GetModelService {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private modelsService: ModelsService,
    private structsService: StructsService
  ) {}

  async getModel(item: {
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    modelId: string;
  }): Promise<{
    needValidate: boolean;
    struct: StructX;
    userMember: Member;
    model: ModelX;
  }> {
    let { userId, projectId, repoId, branchId, envId, modelId } = item;

    await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: userId,
      projectId: projectId
    });

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
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

    // user can get model to add dashboard or report filters without model access - OK
    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: modelId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendGetModelResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      userMember: apiUserMember,
      model: this.modelsService.tabToApi({
        model: model,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRoles
        })
      })
    };

    return payload;
  }
}
