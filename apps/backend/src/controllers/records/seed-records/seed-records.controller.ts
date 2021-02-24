import { Controller, Post, UseGuards } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { wrapper } from '~backend/barrels/wrapper';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@Controller()
export class SeedRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private usersService: UsersService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async seedRecords(
    @ValidateRequest(apiToBackend.ToBackendSeedRecordsRequest)
    reqValid: apiToBackend.ToBackendSeedRecordsRequest
  ) {
    let payloadUsers = reqValid.payload.users;
    let payloadMembers = reqValid.payload.members;
    let payloadOrgs = reqValid.payload.orgs;
    let payloadProjects = reqValid.payload.projects;

    //

    let users: entities.UserEntity[] = [];
    let orgs: entities.OrgEntity[] = [];
    let projects: entities.ProjectEntity[] = [];
    let members: entities.MemberEntity[] = [];
    let structs: entities.StructEntity[] = [];
    let branches: entities.BranchEntity[] = [];
    let vizs: entities.VizEntity[] = [];
    let queries: entities.QueryEntity[] = [];
    let models: entities.ModelEntity[] = [];
    let mconfigs: entities.MconfigEntity[] = [];
    let dashboards: entities.DashboardEntity[] = [];

    if (common.isDefined(payloadUsers)) {
      await asyncPool(
        1,
        payloadUsers,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadUsersItem) => {
          let alias = await this.usersService.makeAlias(x.email);
          let { salt, hash } = common.isDefined(x.password)
            ? await this.usersService.makeSaltAndHash(x.password)
            : { salt: undefined, hash: undefined };

          let newUser = maker.makeUser({
            userId: x.userId,
            email: x.email,
            isEmailVerified: x.isEmailVerified,
            emailVerificationToken: x.emailVerificationToken,
            passwordResetToken: x.passwordResetToken,
            hash: hash,
            salt: salt,
            alias: alias,
            status: x.status,
            passwordResetExpiresTs: common.isDefined(x.passwordResetExpiresTs)
              ? x.passwordResetExpiresTs
              : common.isDefined(x.passwordResetToken)
              ? helper.makeTsUsingOffsetFromNow(
                  constants.PASSWORD_EXPIRES_OFFSET
                )
              : undefined
          });

          users.push(newUser);
        }
      );
    }

    if (common.isDefined(payloadOrgs)) {
      await asyncPool(
        1,
        payloadOrgs,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadOrgsItem) => {
          let newOrg = maker.makeOrg({
            orgId: x.orgId,
            name: x.name,
            ownerEmail: x.ownerEmail,
            ownerId: users.find(u => u.email === x.ownerEmail).user_id
          });

          let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newOrg.org_id
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateOrgResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: newOrg.org_id,
                projectId: null
              }),
              message: createOrgRequest,
              checkIsOk: true
            }
          );

          orgs.push(newOrg);
        }
      );
    }

    if (common.isDefined(payloadProjects)) {
      await asyncPool(
        1,
        payloadProjects,
        async (
          x: apiToBackend.ToBackendSeedRecordsRequestPayloadProjectsItem
        ) => {
          let newProject = maker.makeProject({
            orgId: x.orgId,
            projectId: x.projectId,
            name: x.name
          });

          let toDiskSeedProjectRequest: apiToDisk.ToDiskSeedProjectRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newProject.org_id,
              projectId: newProject.project_id,
              devRepoId: users[0].user_id,
              userAlias: users[0].alias
            }
          };

          let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskSeedProjectResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: newProject.org_id,
                projectId: newProject.project_id
              }),
              message: toDiskSeedProjectRequest,
              checkIsOk: true
            }
          );

          let structId = common.makeId();

          let toBlockmlRebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest = {
            info: {
              name:
                apiToBlockml.ToBlockmlRequestInfoNameEnum
                  .ToBlockmlRebuildStruct,
              traceId: reqValid.info.traceId
            },
            payload: {
              structId: structId,
              orgId: newProject.org_id,
              projectId: newProject.project_id,
              files: helper.diskFilesToBlockmlFiles(diskResponse.payload.files),
              connections: []
            }
          };

          let blockmlRebuildStructResponse = await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
            {
              routingKey: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
              message: toBlockmlRebuildStructRequest,
              checkIsOk: true
            }
          );

          let {
            weekStart,
            allowTimezones,
            defaultTimezone,
            errors,
            views,
            udfsDict,
            vizs: vizsApi,
            mconfigs: mconfigsApi,
            queries: queriesApi,
            dashboards: dashboardsApi,
            models: modelsApi
          } = blockmlRebuildStructResponse.payload;

          let struct = maker.makeStruct({
            projectId: newProject.project_id,
            structId: structId,
            weekStart: weekStart,
            allowTimezones: common.booleanToEnum(allowTimezones),
            defaultTimezone: defaultTimezone,
            errors: errors,
            views: views,
            udfsDict: udfsDict
          });

          let prodBranch = maker.makeBranch({
            structId: structId,
            projectId: newProject.project_id,
            repoId: common.PROD_REPO_ID,
            branchId: common.BRANCH_MASTER
          });

          let devBranch = maker.makeBranch({
            structId: structId,
            projectId: newProject.project_id,
            repoId: users[0].user_id,
            branchId: common.BRANCH_MASTER
          });

          projects.push(newProject);
          structs.push(struct);
          branches = [...branches, prodBranch, devBranch];

          vizs = [...vizs, ...vizsApi.map(z => wrapper.wrapToEntityViz(z))];

          models = [
            ...models,
            ...modelsApi.map(z => wrapper.wrapToEntityModel(z))
          ];

          queries = [
            ...queries,
            ...queriesApi.map(z => wrapper.wrapToEntityQuery(z))
          ];

          dashboards = [
            ...dashboards,
            ...dashboardsApi.map(z => wrapper.wrapToEntityDashboard(z))
          ];

          mconfigs = [
            ...mconfigs,
            ...mconfigsApi.map(z => wrapper.wrapToEntityMconfig(z))
          ];
        }
      );
    }

    if (common.isDefined(payloadMembers)) {
      await asyncPool(
        1,
        payloadMembers,
        async (
          x: apiToBackend.ToBackendSeedRecordsRequestPayloadMembersItem
        ) => {
          let user = users.find(u => u.email === x.email);

          let newMember = maker.makeMember({
            projectId: x.projectId,
            user: user,
            isAdmin: x.isAdmin,
            isEditor: x.isEditor,
            isExplorer: x.isExplorer
          });

          members.push(newMember);
        }
      );
    }

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          users: users,
          orgs: orgs,
          projects: projects,
          members: members,
          structs: structs,
          branches: branches,
          vizs: vizs,
          queries: queries,
          models: models,
          mconfigs: mconfigs,
          dashboards: dashboards
        }
      });
    });

    let payload: apiToBackend.ToBackendSeedRecordsResponse['payload'] = {};

    return payload;
  }
}
