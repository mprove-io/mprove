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

    let envId = common.PROJECT_ENV_PROD;

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

    let ownerOrgs = await this.orgsRepository.find({
      owner_id: user.user_id
    });

    let orgIdsWithDuplicates = [...orgs, ...ownerOrgs].map(x => x.org_id);

    let existingOrgIds = [...new Set(orgIdsWithDuplicates)];

    let resultOrgId =
      common.isDefined(orgId) && existingOrgIds.indexOf(orgId) > -1
        ? orgId
        : existingOrgIds[0];

    let resultOrg = [...orgs, ...ownerOrgs].find(x => x.org_id === resultOrgId);

    let existingProjectIds = projects
      .filter(x => x.org_id === resultOrgId)
      .map(x => x.project_id);

    let resultProjectId =
      common.isDefined(projectId) && existingProjectIds.indexOf(projectId) > -1
        ? projectId
        : existingProjectIds[0];

    let resultProject = projects.find(x => x.project_id === resultProjectId);

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
        : resultProject?.default_branch;

    let avatar = await this.avatarsRepository.findOne({
      where: {
        user_id: user.user_id
      }
    });

    let payload: apiToBackend.ToBackendGetNavResponsePayload = {
      avatarSmall: avatar?.avatar_small,
      avatarBig: avatar?.avatar_big,
      orgId: resultOrgId,
      orgOwnerId: resultOrg?.owner_id,
      orgName: resultOrg?.name,
      projectId: resultProjectId,
      projectName: resultProject?.name,
      projectDefaultBranch: resultProject?.default_branch,
      isRepoProd: resultRepoId === common.PROD_REPO_ID,
      branchId: resultBranchId,
      envId: envId,
      user: wrapper.wrapToApiUser(user),
      serverNowTs: Date.now()
    };

    return payload;
  }
}
