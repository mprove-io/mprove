import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetModelsRequestDto,
  ToBackendGetModelsResponseDto
} from '#backend/controllers/models/get-models/get-models.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { TabService } from '#backend/services/tab.service';
import { UNCATEGORIZED_SPACE_TITLE } from '#common/constants/top';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import type { ModelX } from '#common/zod/backend/model-x';
import type { Space } from '#common/zod/blockml/space';
import type { ToBackendGetModelsResponsePayload } from '#common/zod/to-backend/models/to-backend-get-models';

@ApiTags('Models')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetModelsController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeDisplaySpacesBySpace(item: { spaces: Space[] }): Map<string, string> {
    let { spaces } = item;

    let sortedSpaces = [...(spaces ?? [])].sort((a, b) => {
      let aDepth = a.space.split('.').length;
      let bDepth = b.space.split('.').length;

      return aDepth > bDepth ? 1 : bDepth > aDepth ? -1 : 0;
    });

    let displaySpacesBySpace = new Map<string, string>();

    sortedSpaces.forEach(space => {
      let parts = space.space.split('.');
      let title = space.title || parts[parts.length - 1];
      let parentSpaceName =
        parts.length > 1
          ? parts.slice(0, parts.length - 1).join('.')
          : undefined;
      let parentDisplaySpace = isDefined(parentSpaceName)
        ? displaySpacesBySpace.get(parentSpaceName)
        : undefined;
      let displaySpace = isDefinedAndNotEmpty(parentDisplaySpace)
        ? `${parentDisplaySpace} - ${title}`
        : title;

      displaySpacesBySpace.set(space.space, displaySpace);
    });

    return displaySpacesBySpace;
  }

  makeModelDisplaySpace(item: {
    modelSpace: string | undefined;
    displaySpacesBySpace: Map<string, string>;
  }): string {
    let { modelSpace, displaySpacesBySpace } = item;

    if (isDefinedAndNotEmpty(modelSpace) === false) {
      return UNCATEGORIZED_SPACE_TITLE;
    }

    return displaySpacesBySpace.get(modelSpace) ?? '';
  }

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetModels)
  @ApiOperation({
    summary: 'GetModels',
    description: 'Get models'
  })
  @ApiOkResponse({
    type: ToBackendGetModelsResponseDto
  })
  async getModels(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetModelsRequestDto
  ) {
    let { projectId, repoId, branchId, envId, filterByModelIds } = body.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
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

    let models = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(...where)
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    let displaySpacesBySpace = this.makeDisplaySpacesBySpace({
      spaces: struct.spaces ?? []
    });

    let apiModels: ModelX[] = models.map(model =>
      this.modelsService.tabToApi({
        model: model,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRolesCombined
        }),
        displaySpace: this.makeModelDisplaySpace({
          modelSpace: model.space,
          displaySpacesBySpace: displaySpacesBySpace
        })
      })
    );

    let payload: ToBackendGetModelsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      userMember: apiUserMember,
      models: apiModels.sort((a, b) =>
        a.label > b.label ? 1 : b.label > a.label ? -1 : 0
      )
    };

    return payload;
  }
}
