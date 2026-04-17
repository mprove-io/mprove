import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetSuggestFieldsRequestDto,
  ToBackendGetSuggestFieldsResponseDto
} from '#backend/controllers/suggest-fields/get-suggest-fields/get-suggest-fields.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { DashboardsService } from '#backend/services/db/dashboards.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ReportsService } from '#backend/services/db/reports.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { TabService } from '#backend/services/tab.service';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { SuggestField } from '#common/zod/backend/suggest-field';
import type { ToBackendGetSuggestFieldsResponsePayload } from '#common/zod/to-backend/suggest-fields/to-backend-get-suggest-fields';

@ApiTags('SuggestFields')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetSuggestFieldsController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private dashboardsService: DashboardsService,
    private reportsService: ReportsService,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields)
  @ApiOperation({
    summary: 'GetSuggestFields',
    description: 'Get suggested dimension fields for a dashboard or report'
  })
  @ApiOkResponse({
    type: ToBackendGetSuggestFieldsResponseDto
  })
  async getSuggestFields(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetSuggestFieldsRequestDto
  ) {
    let { projectId, repoId, branchId, envId, parentId, parentType } =
      body.payload;

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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let models = await this.db.drizzle.query.modelsTable
      .findMany({
        where: eq(modelsTable.structId, bridge.structId)
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let extraModelIds: string[] = [];

    if (parentType === MconfigParentTypeEnum.Dashboard) {
      let dashboard =
        await this.dashboardsService.getDashboardCheckExistsAndAccess({
          dashboardId: parentId,
          structId: bridge.structId,
          userMember: userMember,
          user: user
        });

      extraModelIds = dashboard.tiles.map(x => x.modelId);
    } else if (parentType === MconfigParentTypeEnum.Report) {
      let report = await this.reportsService.getReportCheckExistsAndAccess({
        projectId: projectId,
        reportId: parentId,
        structId: bridge.structId,
        userMember: userMember,
        user: user
      });

      extraModelIds = report.rows.map(x => x.modelId).filter(y => isDefined(y));
    }

    let modelsForSuggest = models
      .filter(
        model =>
          extraModelIds.indexOf(model.modelId) > -1 ||
          checkModelAccess({
            member: userMember,
            modelAccessRoles: model.accessRoles
          })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    let suggestFields: SuggestField[] = [];

    modelsForSuggest.forEach(x => {
      x.fields
        .filter(
          y =>
            y.hidden === false &&
            y.fieldClass === FieldClassEnum.Dimension &&
            y.result === FieldResultEnum.String
        )
        .forEach(field => {
          let partFieldLabel = isDefined(field.groupLabel)
            ? `${field.groupLabel} ${field.label}`
            : field.label;

          let suggestField: SuggestField = {
            modelFieldRef: `${x.modelId}.${field.id}`,
            connectionType: x.connectionType,
            topLabel: x.label,
            partNodeLabel: field.topLabel,
            partFieldLabel: partFieldLabel,
            partLabel: `${x.label} ${field.topLabel} ${partFieldLabel}`,
            fieldClass: field.fieldClass,
            result: field.result
          };

          suggestFields.push(suggestField);
        });

      return suggestFields;
    });

    suggestFields = suggestFields.sort((a, b) =>
      a.fieldClass !== FieldClassEnum.Dimension &&
      b.fieldClass === FieldClassEnum.Dimension
        ? 1
        : a.fieldClass === FieldClassEnum.Dimension &&
            b.fieldClass !== FieldClassEnum.Dimension
          ? -1
          : a.fieldClass !== FieldClassEnum.Filter &&
              b.fieldClass === FieldClassEnum.Filter
            ? 1
            : a.fieldClass === FieldClassEnum.Filter &&
                b.fieldClass !== FieldClassEnum.Filter
              ? -1
              : a.partLabel > b.partLabel
                ? 1
                : b.partLabel > a.partLabel
                  ? -1
                  : 0
    );

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendGetSuggestFieldsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      userMember: apiUserMember,
      suggestFields: suggestFields
    };

    return payload;
  }
}
