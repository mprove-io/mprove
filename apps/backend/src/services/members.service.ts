import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { UserEntity } from '~backend/models/store-entities/_index';
import { BlockmlService } from './blockml.service';
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
    private blockmlService: BlockmlService,
    private dbService: DbService
  ) {}

  async checkMemberIsAdmin(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      where: {
        member_id: memberId,
        project_id: projectId
      }
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

  async getMemberCheckIsEditorOrAdmin(item: {
    memberId: string;
    projectId: string;
  }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      where: {
        member_id: memberId,
        project_id: projectId
      }
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

    return member;
  }

  async getMemberCheckIsEditor(item: { memberId: string; projectId: string }) {
    let { projectId, memberId } = item;

    let member = await this.membersRepository.findOne({
      where: {
        member_id: memberId,
        project_id: projectId
      }
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
      where: {
        member_id: memberId,
        project_id: projectId
      }
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
      where: {
        member_id: memberId,
        project_id: projectId
      }
    });

    if (common.isDefined(member)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_ALREADY_EXISTS
      });
    }
  }

  async addMemberToFirstProject(item: { user: UserEntity; traceId: string }) {
    let { user, traceId } = item;

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (common.isDefined(firstProjectId)) {
      let project = await this.projectsRepository.findOne({
        where: {
          project_id: firstProjectId
        }
      });

      if (common.isDefined(project)) {
        let member = await this.membersRepository.findOne({
          where: {
            member_id: user.user_id,
            project_id: firstProjectId
          }
        });

        if (common.isUndefined(member)) {
          let newMember = maker.makeMember({
            projectId: firstProjectId,
            user: user,
            isAdmin: common.BoolEnum.FALSE,
            isEditor: common.BoolEnum.TRUE,
            isExplorer: common.BoolEnum.TRUE
          });

          let toDiskCreateDevRepoRequest: apiToDisk.ToDiskCreateDevRepoRequest =
            {
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

          let diskResponse =
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
            where: {
              project_id: firstProjectId,
              repo_id: common.PROD_REPO_ID,
              branch_id: project.default_branch
            }
          });

          let devBranch = maker.makeBranch({
            projectId: firstProjectId,
            repoId: newMember.member_id,
            branchId: project.default_branch
          });

          let prodBranchBridges = await this.bridgesRepository.find({
            where: {
              project_id: prodBranch.project_id,
              repo_id: prodBranch.repo_id,
              branch_id: prodBranch.branch_id
            }
          });

          let devBranchBridges: entities.BridgeEntity[] = [];

          prodBranchBridges.forEach(x => {
            let devBranchBridge = maker.makeBridge({
              projectId: devBranch.project_id,
              repoId: devBranch.repo_id,
              branchId: devBranch.branch_id,
              envId: x.env_id,
              structId: common.EMPTY_STRUCT_ID,
              needValidate: common.BoolEnum.TRUE
            });

            devBranchBridges.push(devBranchBridge);
          });

          await forEachSeries(devBranchBridges, async x => {
            if (x.env_id === common.PROJECT_ENV_PROD) {
              let structId = common.makeId();

              await this.blockmlService.rebuildStruct({
                traceId,
                orgId: project.org_id,
                projectId: firstProjectId,
                structId,
                diskFiles: diskResponse.payload.files,
                mproveDir: diskResponse.payload.mproveDir,
                envId: x.env_id
              });

              x.struct_id = structId;
              x.need_validate = common.BoolEnum.FALSE;
            } else {
              x.need_validate = common.BoolEnum.TRUE;
            }
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
