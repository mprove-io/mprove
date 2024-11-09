import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetNavController {
  constructor(
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private structsService: StructsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetNav)
  async getNav(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetNavRequest = request.body;

    let { orgId, projectId, getRepo } = reqValid.payload;

    let members = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    // let members = await this.membersRepository.find({
    //   where: {
    //     member_id: user.user_id
    //   }
    // });

    let projectIds = members.map(x => x.projectId);

    let projects =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable.findMany({
            where: inArray(projectsTable.projectId, projectIds)
          });

    // await this.projectsRepository.find({
    //     where: {
    //       project_id: In(projectIds)
    //     }
    //   });

    let orgIds = projects.map(x => x.orgId);

    let orgs =
      orgIds.length === 0
        ? []
        : await this.db.drizzle.query.orgsTable.findMany({
            where: inArray(orgsTable.orgId, orgIds)
          });

    // await this.orgsRepository.find({
    //     where: {
    //       org_id: In(orgIds)
    //     }
    //   });

    let ownerOrgs = await this.db.drizzle.query.orgsTable.findMany({
      where: eq(orgsTable.ownerId, user.userId)
    });

    // let ownerOrgs = await this.orgsRepository.find({
    //   where: {
    //     owner_id: user.user_id
    //   }
    // });

    let orgIdsWithDuplicates = [...orgs, ...ownerOrgs].map(x => x.orgId);

    let existingOrgIds = [...new Set(orgIdsWithDuplicates)];

    let resultOrgId =
      common.isDefined(orgId) && existingOrgIds.indexOf(orgId) > -1
        ? orgId
        : existingOrgIds[0];

    let resultOrg = [...orgs, ...ownerOrgs].find(x => x.orgId === resultOrgId);

    let existingProjectIds = projects
      .filter(x => x.orgId === resultOrgId)
      .map(x => x.projectId);

    let resultProjectId =
      common.isDefined(projectId) && existingProjectIds.indexOf(projectId) > -1
        ? projectId
        : existingProjectIds[0];

    let resultProject = projects.find(x => x.projectId === resultProjectId);

    let bridge: schemaPostgres.BridgeEnt;

    if (common.isDefined(resultProject)) {
      bridge = await this.db.drizzle.query.bridgesTable.findFirst({
        where: and(
          eq(bridgesTable.projectId, resultProject.projectId),
          eq(bridgesTable.repoId, common.PROD_REPO_ID),
          eq(bridgesTable.branchId, resultProject.defaultBranch),
          eq(bridgesTable.envId, common.PROJECT_ENV_PROD)
        )
      });

      // bridge = await this.bridgesRepository.findOne({
      //   where: {
      //     project_id: resultProject.project_id,
      //     repo_id: common.PROD_REPO_ID,
      //     branch_id: resultProject.default_branch,
      //     env_id: common.PROJECT_ENV_PROD
      //   }
      // });
    }

    let avatar = await this.db.drizzle.query.avatarsTable.findFirst({
      where: eq(avatarsTable.userId, user.userId)
    });

    // let avatar = await this.avatarsRepository.findOne({
    //   where: {
    //     user_id: user.user_id
    //   }
    // });

    let apiMember;
    let apiStruct;
    let repo;

    if (
      getRepo === true &&
      common.isDefined(resultOrgId) &&
      common.isDefined(resultProjectId) &&
      common.isDefined(bridge)
    ) {
      let userMember = await this.membersService.getMemberCheckExists({
        projectId: resultProject.projectId,
        memberId: user.userId
      });

      apiMember = this.wrapToApiService.wrapToApiMember(userMember);

      let struct = await this.structsService.getStructCheckExists({
        structId: bridge.structId,
        projectId: resultProject.projectId
      });

      apiStruct = this.wrapToApiService.wrapToApiStruct(struct);

      let toDiskGetCatalogNodesRequest: apiToDisk.ToDiskGetCatalogNodesRequest =
        {
          info: {
            name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: resultProject.orgId,
            projectId: resultProject.projectId,
            repoId: bridge.repoId,
            branch: bridge.branchId,
            isFetch: true,
            remoteType: resultProject.remoteType,
            gitUrl: resultProject.gitUrl,
            privateKey: resultProject.privateKey,
            publicKey: resultProject.publicKey
          }
        };

      let diskResponse =
        await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogNodesResponse>(
          {
            routingKey: helper.makeRoutingKeyToDisk({
              orgId: resultProject.orgId,
              projectId: resultProject.projectId
            }),
            message: toDiskGetCatalogNodesRequest,
            checkIsOk: true
          }
        );

      repo = diskResponse?.payload.repo;
    }

    let payload: apiToBackend.ToBackendGetNavResponsePayload = {
      avatarSmall: avatar?.avatarSmall,
      avatarBig: avatar?.avatarBig,
      orgId: resultOrgId,
      orgOwnerId: resultOrg?.ownerId,
      orgName: resultOrg?.name,
      projectId: resultProjectId,
      projectName: resultProject?.name,
      projectDefaultBranch: resultProject?.defaultBranch,
      isRepoProd: true,
      branchId: resultProject?.defaultBranch,
      envId: common.PROJECT_ENV_PROD,
      needValidate: common.isDefined(bridge) ? bridge.needValidate : false,
      user: this.wrapToApiService.wrapToApiUser(user),
      serverNowTs: Date.now(),
      userMember: apiMember,
      struct: apiStruct,
      repo: repo
    };

    return payload;
  }
}
