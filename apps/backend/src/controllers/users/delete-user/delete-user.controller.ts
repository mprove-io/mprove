import { Controller, Post } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class DeleteUserController {
  constructor(
    private usersRepository: repositories.UsersRepository,
    private membersRepository: repositories.MembersRepository,
    private rabbitService: RabbitService,
    private orgsRepository: repositories.OrgsRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private branchesRepository: repositories.BranchesRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteUser)
  async deleteUser(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteUserRequest)
    reqValid: apiToBackend.ToBackendDeleteUserRequest
  ) {
    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;

    let ownerOrgs = await this.orgsRepository.find({
      where: {
        owner_id: user.user_id
      }
    });

    if (ownerOrgs.length > 0) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_IS_ORG_OWNER,
        data: {
          orgIds: ownerOrgs.map(x => x.org_id)
        }
      });
    }

    let userAdminMembers = await this.membersRepository.find({
      where: {
        member_id: user.user_id,
        is_admin: common.BoolEnum.TRUE
      }
    });

    let userAdminProjectIds = userAdminMembers.map(x => x.project_id);

    let admins =
      userAdminProjectIds.length === 0
        ? []
        : await this.membersRepository.find({
            where: {
              project_id: In(userAdminProjectIds),
              is_admin: common.BoolEnum.TRUE
            }
          });

    let erProjectIds: string[] = [];

    userAdminProjectIds.forEach(projectId => {
      let projectAdmins = admins.filter(x => x.project_id === projectId);
      if (projectAdmins.length === 1) {
        erProjectIds.push(projectId);
      }
    });

    if (erProjectIds.length > 0) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_IS_THE_ONLY_PROJECT_ADMIN,
        data: {
          projectIds: erProjectIds
        }
      });
    }

    let userMembers = await this.membersRepository.find({
      where: {
        member_id: user.user_id
      }
    });

    let projectIds = userMembers.map(x => x.project_id);

    let projects =
      projectIds.length === 0
        ? []
        : await this.projectsRepository.find({
            where: {
              project_id: In(projectIds)
            }
          });

    await asyncPool(1, userMembers, async (m: entities.MemberEntity) => {
      let project = projects.find(p => p.project_id === m.project_id);

      let toDiskDeleteDevRepoRequest: apiToDisk.ToDiskDeleteDevRepoRequest = {
        info: {
          name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
          traceId: traceId
        },
        payload: {
          orgId: project.org_id,
          projectId: project.project_id,
          devRepoId: user.user_id
        }
      };

      await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteDevRepoResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: project.org_id,
            projectId: project.project_id
          }),
          message: toDiskDeleteDevRepoRequest,
          checkIsOk: true
        }
      );
    });

    await this.usersRepository.delete({ user_id: user.user_id });
    await this.membersRepository.delete({ member_id: user.user_id });
    await this.branchesRepository.delete({ repo_id: user.alias });

    let payload = {};

    return payload;
  }
}
