import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { DbService } from '~backend/services/db.service';
import { RabbitService } from '~backend/services/rabbit.service';

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class SpecialRebuildStructsController {
  constructor(
    private rabbitService: RabbitService,
    private projectsRepository: repositories.ProjectsRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private membersRepository: repositories.MembersRepository,
    private blockmlService: BlockmlService,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSpecialRebuildStructs
  )
  async specialRebuildStructs(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendSpecialRebuildStructsRequest =
      request.body;

    let { traceId } = reqValid.info;
    let { specialKey, userIds, skipRebuild } = reqValid.payload;

    let envSpecialKey =
      this.cs.get<interfaces.Config['specialKey']>('specialKey');

    if (common.isUndefinedOrEmpty(specialKey) || specialKey !== envSpecialKey) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_WRONG_SPECIAL_KEY
      });
    }

    let projectIds: string[] = [];
    let members: entities.MemberEntity[] = [];

    if (userIds.length > 0) {
      members = await this.membersRepository.find({
        where: { member_id: In(userIds) }
      });

      projectIds = members.map(x => x.project_id);
    }

    let projects: entities.ProjectEntity[] = [];

    if (projectIds.length > 0) {
      projects = await this.projectsRepository.find({
        where: { project_id: In(projectIds) }
      });
    } else {
      projects = await this.projectsRepository.find();
    }

    let bridges: entities.BridgeEntity[];

    if (userIds.length > 0) {
      bridges = await this.bridgesRepository.find({
        where: { repo_id: In(userIds) }
      });
    } else {
      bridges = await this.bridgesRepository.find();
    }

    let notFoundProjectIds: string[] = [];
    let errorGetCatalogBridgeItems: apiToBackend.BridgeItem[] = [];
    let successBridgeItems: apiToBackend.BridgeItem[] = [];

    await asyncPool(1, bridges, async bridge => {
      let project = projects.find(x => x.project_id === bridge.project_id);

      if (common.isUndefined(project)) {
        notFoundProjectIds.push(bridge.project_id);
        return;
      }

      let bridgeItem: apiToBackend.BridgeItem = {
        orgId: project.org_id,
        projectId: project.project_id,
        repoId: bridge.repo_id,
        branchId: bridge.branch_id,
        envId: bridge.env_id,
        structId: bridge.struct_id,
        needValidate: common.enumToBoolean(bridge.need_validate)
      };

      if (skipRebuild === false) {
        let getCatalogFilesRequest: apiToDisk.ToDiskGetCatalogFilesRequest = {
          info: {
            name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
            traceId: reqValid.info.traceId
          },
          payload: {
            orgId: project.org_id,
            projectId: project.project_id,
            repoId: bridge.repo_id,
            branch: bridge.branch_id,
            remoteType: project.remote_type,
            gitUrl: project.git_url,
            privateKey: project.private_key,
            publicKey: project.public_key
          }
        };

        let getCatalogFilesResponse =
          await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogFilesResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: project.org_id,
                projectId: project.project_id
              }),
              message: getCatalogFilesRequest,
              checkIsOk: false
            }
          );

        if (
          getCatalogFilesResponse.info.status !==
          common.ResponseInfoStatusEnum.Ok
        ) {
          bridgeItem.errorMessage = getCatalogFilesResponse.info.error.message;
          errorGetCatalogBridgeItems.push(bridgeItem);
          return;
        }

        let structId = common.makeId();

        await this.blockmlService.rebuildStruct({
          traceId,
          orgId: project.org_id,
          projectId: project.project_id,
          structId: structId,
          diskFiles: getCatalogFilesResponse.payload.files,
          mproveDir: getCatalogFilesResponse.payload.mproveDir,
          envId: bridge.env_id
        });

        bridge.struct_id = structId;
        bridge.need_validate = common.BoolEnum.FALSE;
      } else {
        bridge.need_validate = common.BoolEnum.TRUE;
      }

      await this.dbService.writeRecords({
        modify: true,
        records: {
          bridges: [bridge]
        }
      });

      bridgeItem.structId = bridge.struct_id;
      bridgeItem.needValidate = common.enumToBoolean(bridge.need_validate);

      successBridgeItems.push(bridgeItem);
    });

    let payload: apiToBackend.ToBackendSpecialRebuildStructsResponsePayload = {
      notFoundProjectIds: notFoundProjectIds,
      successTotal: successBridgeItems.length,
      errorTotal: errorGetCatalogBridgeItems.length,
      successBridgeItems: successBridgeItems,
      errorGetCatalogBridgeItems: errorGetCatalogBridgeItems
    };

    return payload;
  }
}
