import { Controller, Post } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { DbService } from '~backend/services/db.service';
import { RabbitService } from '~backend/services/rabbit.service';

@SkipJwtCheck()
@Controller()
export class RebuildStructAllSpecialController {
  constructor(
    private rabbitService: RabbitService,
    private projectsRepository: repositories.ProjectsRepository,
    private branchesRepository: repositories.BranchesRepository,
    private blockmlService: BlockmlService,
    private dbService: DbService
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRebuildStructAllSpecial
  )
  async rebuildStructAllSpecial(
    @ValidateRequest(apiToBackend.ToBackendRebuildStructAllSpecialRequest)
    reqValid: apiToBackend.ToBackendRebuildStructAllSpecialRequest
  ) {
    let { traceId } = reqValid.info;
    let { specialKey } = reqValid.payload;

    let projects = await this.projectsRepository.find();

    let branches = await this.branchesRepository.find({
      where: { repo_id: common.PROD_REPO_ID, branch_id: common.BRANCH_MASTER }
    });

    let notFoundProjectIds: string[] = [];
    let getCatalogErrorProjectIds: string[] = [];
    let successProjectIds: string[] = [];

    await asyncPool(1, branches, async branch => {
      let project = projects.find(x => x.project_id === branch.project_id);

      if (common.isUndefined(project)) {
        notFoundProjectIds.push(branch.project_id);
        return;
      }

      // to disk

      let getCatalogFilesRequest: apiToDisk.ToDiskGetCatalogFilesRequest = {
        info: {
          name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
          traceId: reqValid.info.traceId
        },
        payload: {
          orgId: project.org_id,
          projectId: project.project_id,
          repoId: branch.repo_id,
          branch: branch.branch_id
        }
      };

      let getCatalogFilesResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogFilesResponse>(
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
        getCatalogFilesResponse.info.status !== common.ResponseInfoStatusEnum.Ok
      ) {
        getCatalogErrorProjectIds.push(branch.project_id);
        return;
      }

      // to blockml

      let structId = common.makeId();

      branch.struct_id = structId;

      await this.blockmlService.rebuildStruct({
        traceId,
        orgId: project.org_id,
        projectId: project.project_id,
        structId: structId,
        diskFiles: getCatalogFilesResponse.payload.files
      });

      await this.dbService.writeRecords({
        modify: true,
        records: {
          branches: [branch]
        }
      });

      successProjectIds.push(branch.project_id);
    });

    let payload: apiToBackend.ToBackendRebuildStructAllSpecialResponsePayload = {
      successProjectIds: successProjectIds,
      notFoundProjectIds: notFoundProjectIds,
      getCatalogErrorProjectIds: getCatalogErrorProjectIds
    };

    return payload;
  }
}
