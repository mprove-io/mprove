import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { RabbitService } from '~backend/services/rabbit.service';

@SkipJwtCheck()
@Controller()
export class ConfirmUserEmailController {
  constructor(
    private userRepository: repositories.UsersRepository,
    private membersRepository: repositories.MembersRepository,
    private branchesRepository: repositories.BranchesRepository,
    private projectsRepository: repositories.ProjectsRepository,
    private rabbitService: RabbitService,
    private dbService: DbService,
    private jwtService: JwtService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail)
  async confirmUserEmail(
    @ValidateRequest(apiToBackend.ToBackendConfirmUserEmailRequest)
    reqValid: apiToBackend.ToBackendConfirmUserEmailRequest
  ) {
    let { traceId } = reqValid.info;
    let { token } = reqValid.payload;

    let user = await this.userRepository.findOne({
      email_verification_token: token
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    let payload: apiToBackend.ToBackendConfirmUserEmailResponsePayload = {};

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
              devRepoId: newMember.member_id
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
            branch_id: common.BRANCH_MASTER
          });

          let devBranch = maker.makeBranch({
            structId: prodBranch.struct_id,
            projectId: firstProjectId,
            repoId: newMember.member_id,
            branchId: common.BRANCH_MASTER
          });

          await this.dbService.writeRecords({
            modify: true,
            records: {
              members: [newMember],
              branches: [devBranch]
            }
          });
        }
      }
    }

    if (user.is_email_verified === common.BoolEnum.FALSE) {
      user.is_email_verified = common.BoolEnum.TRUE;

      await this.dbService.writeRecords({
        modify: true,
        records: {
          users: [user]
        }
      });

      payload = {
        token: this.jwtService.sign({ userId: user.user_id }),
        user: wrapper.wrapToApiUser(user)
      };
    }

    return payload;
  }
}
