import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { UserEntity } from '~backend/models/store-entities/_index';
import { DbService } from './db.service';
import { RabbitService } from './rabbit.service';

@Injectable()
export class MembersService {
  constructor(
    private membersRepository: repositories.MembersRepository,
    private cs: ConfigService<interfaces.Config>,
    private branchesRepository: repositories.BranchesRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private rabbitService: RabbitService,
    private dbService: DbService
  ) {}

  async checkMemberIsAdmin(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.is_admin !== common.BoolEnum.TRUE) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_ADMIN
      });
    }
  }

  async checkMemberIsEditorOrAdmin(item: {
    memberId: string;
    projectId: string;
  }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (
      member.is_editor !== common.BoolEnum.TRUE &&
      member.is_admin !== common.BoolEnum.TRUE
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EDITOR_OR_ADMIN
      });
    }
  }

  async getMemberCheckIsEditor(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    if (member.is_editor !== common.BoolEnum.TRUE) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EDITOR
      });
    }

    return member;
  }

  async getMemberCheckExists(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_DOES_NOT_EXIST
      });
    }

    return member;
  }

  async checkMemberDoesNotExist(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      member_id: memberId,
      project_id: projectId
    });

    if (common.isDefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_ALREADY_EXISTS
      });
    }
  }

  async addMemberToFirstProject(item: { user: UserEntity; traceId: string }) {
    let { user, traceId } = item;

    let firstProjectId = this.cs.get<interfaces.Config['firstProjectId']>(
      'firstProjectId'
    );

    if (common.isDefined(firstProjectId)) {
      let project = await this.projectsRepository.findOne({
        project_id: firstProjectId
      });

      if (common.isDefined(project)) {
        let member = await this.membersRepository.findOne({
          member_id: user.user_id,
          project_id: firstProjectId
        });

        if (common.isUndefined(member)) {
          let newMember = maker.makeMember({
            projectId: firstProjectId,
            user: user,
            isAdmin: common.BoolEnum.FALSE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          });

          let toDiskCreateDevRepoRequest: apiToDisk.ToDiskCreateDevRepoRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
              traceId: traceId
            },
            payload: {
              orgId: project.org_id,
              projectId: firstProjectId,
              devRepoId: newMember.member_id,
              remoteType: project.remote_type,
              gitUrl: project.git_url,
              privateKey: project.private_key,
              publicKey: project.public_key
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateDevRepoResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: project.org_id,
                projectId: firstProjectId
              }),
              message: toDiskCreateDevRepoRequest,
              checkIsOk: true
            }
          );

          let prodBranch = await this.branchesRepository.findOne({
            project_id: firstProjectId,
            repo_id: common.PROD_REPO_ID,
            branch_id: project.default_branch
          });

          let devBranch = maker.makeBranch({
            projectId: firstProjectId,
            repoId: newMember.member_id,
            branchId: project.default_branch
          });

          let prodBranchBridges = await this.bridgesRepository.find({
            project_id: prodBranch.project_id,
            repo_id: prodBranch.repo_id,
            branch_id: prodBranch.branch_id
          });

          let devBranchBridges: entities.BridgeEntity[] = [];

          prodBranchBridges.forEach(x => {
            let devBranchBridge = maker.makeBridge({
              structId: x.struct_id,
              projectId: devBranch.project_id,
              repoId: devBranch.repo_id,
              branchId: devBranch.branch_id,
              envId: x.env_id
            });

            devBranchBridges.push(devBranchBridge);
          });

          await this.dbService.writeRecords({
            modify: true,
            records: {
              members: [newMember],
              branches: [devBranch],
              bridges: [...devBranchBridges]
            }
          });
        }
      }
    }
  }
}
