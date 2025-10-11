import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ModelEnt, modelsTable } from '~backend/drizzle/postgres/schema/models';
import { checkAccess } from '~backend/functions/check-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetModelsRequest,
  ToBackendGetModelsResponsePayload
} from '~common/interfaces/to-backend/models/to-backend-get-models';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetModelsController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private wrapToApiService: WrapEnxToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetModels)
  async getModels(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetModelsRequest = request.body;

    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      filterByModelIds,
      addFields
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let where = [eq(modelsTable.structId, bridge.structId)];

    if (isDefined(filterByModelIds) && filterByModelIds.length > 0) {
      where = [...where, inArray(modelsTable.modelId, filterByModelIds)];
    }

    let models: ModelEnt[] =
      addFields === true
        ? await this.db.drizzle.query.modelsTable.findMany({
            where: and(...where)
          })
        : await this.db.drizzle
            .select({
              structId: modelsTable.structId,
              modelId: modelsTable.modelId,
              type: modelsTable.type,
              connectionId: modelsTable.connectionId,
              connectionType: modelsTable.connectionType,
              filePath: modelsTable.filePath,
              accessRoles: modelsTable.accessRoles,
              label: modelsTable.label,
              nodes: modelsTable.nodes
            })
            .from(modelsTable)
            .where(and(...where));

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: ToBackendGetModelsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiMember,
      models: models
        .map(model =>
          this.wrapToApiService.wrapEnxToApiModel({
            model: model,
            hasAccess: checkAccess({
              userAlias: user.alias,
              member: userMember,
              entity: model
            })
          })
        )
        .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0))
    };

    return payload;
  }
}
