import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class GetNavController {
  constructor(
    private avatarsRepository: repositories.AvatarsRepository,
    private membersRepository: repositories.MembersRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private orgsRepository: repositories.OrgsRepository,
    private branchesRepository: repositories.BranchesRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetNav)
  async getNav(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetNavRequest)
    reqValid: apiToBackend.ToBackendGetNavRequest
  ) {
    let { orgId, projectId, isRepoProd, branchId } = reqValid.payload;

    let repoId =
      common.isUndefined(isRepoProd) || isRepoProd === true
        ? common.PROD_REPO_ID
        : user.alias;

    if (common.isUndefined(repoId)) {
      repoId = common.PROD_REPO_ID;
    }

    let members = await this.membersRepository.find({
      member_id: user.user_id
    });

    let projectIds = members.map(x => x.project_id);
    let projects =
      projectIds.length === 0
        ? []
        : await this.projectsRepository.find({
            project_id: In(projectIds)
          });

    let orgIds = projects.map(x => x.org_id);
    let orgs =
      orgIds.length === 0
        ? []
        : await this.orgsRepository.find({
            org_id: In(orgIds)
          });

    let existingOrgIds = orgs.map(x => x.org_id);

    let resultOrgId =
      common.isDefined(orgId) && existingOrgIds.indexOf(orgId) > -1
        ? orgId
        : existingOrgIds[0];

    let existingProjectIds = projects
      .filter(x => x.org_id === resultOrgId)
      .map(x => x.project_id);

    let resultProjectId =
      common.isDefined(projectId) && existingProjectIds.indexOf(projectId) > -1
        ? projectId
        : existingProjectIds[0];

    let projectMember = members.find(x => x.project_id === resultProjectId);

    let resultRepoId =
      common.isDefined(projectMember) &&
      projectMember.is_editor === common.BoolEnum.TRUE
        ? repoId
        : common.PROD_REPO_ID;

    let branches = await this.branchesRepository.find({
      project_id: resultProjectId,
      repo_id: resultRepoId
    });

    let existingBranchIds = branches.map(x => x.branch_id);

    let resultBranchId =
      resultRepoId === repoId &&
      common.isDefined(branchId) &&
      existingBranchIds.indexOf(branchId) > -1
        ? branchId
        : common.BRANCH_MASTER;

    let avatar = await this.avatarsRepository.findOne({
      select: ['avatar_small'],
      where: {
        user_id: user.user_id
      }
    });

    let payload: apiToBackend.ToBackendGetNavResponsePayload = {
      avatarSmall: avatar?.avatar_small,
      orgId: resultOrgId,
      projectId: resultProjectId,
      isRepoProd: resultRepoId === common.PROD_REPO_ID,
      branchId: resultBranchId,
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
