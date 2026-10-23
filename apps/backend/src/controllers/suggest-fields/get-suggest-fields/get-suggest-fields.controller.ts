import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetSuggestFieldsRequestDto,
  ToBackendGetSuggestFieldsResponseDto
} from '#backend/controllers/suggest-fields/get-suggest-fields/get-suggest-fields.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  DashboardTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getDashboardCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-check-exists-and-access/get-dashboard-check-exists-and-access';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { SuggestField } from '#common/types/backend/parts/suggest-field';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetSuggestFieldsOutput } from '#common/types/backend/routes/suggest-fields/get-suggest-fields/get-suggest-fields-output';

@ApiTags('SuggestFields')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetSuggestFieldsController {
  constructor(
    private membersService: MembersService,
    private modelsService: ModelsService,
    private reportsService: ReportsService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetSuggestFields' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getSuggestFields'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        parentId: body.input.parentId,
        parentType: body.input.parentType,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('dashboard', async v =>
        v.parentType === 'Dashboard'
          ? getDashboardCheckExistsAndAccess({
              db: this.db,
              dashboardId: v.parentId,
              structId: v.bridge.structId,
              userMember: v.userMember,
              user: v.user
            })
          : Result.succeed<DashboardTab>(undefined)
      ),
      Result.bind('report', async v =>
        v.parentType === 'Report'
          ? this.reportsService.getReportCheckExistsAndAccess({
              projectId: v.projectId,
              reportId: v.parentId,
              structId: v.bridge.structId,
              userMember: v.userMember,
              user: v.user
            })
          : Result.succeed<ReportTab>(undefined)
      ),
      Result.bind('extraModelIds', v =>
        Result.succeed<string[]>(
          isDefined(v.dashboard)
            ? v.dashboard.tiles.map(tile => tile.modelId)
            : isDefined(v.report)
              ? v.report.rows
                  .map(row => row.modelId)
                  .filter(modelId => isDefined(modelId))
              : []
        )
      ),
      Result.bind('modelsForSuggest', v =>
        Result.succeed(
          v.models
            .filter(model => {
              let isExtraModel: boolean = v.extraModelIds.includes(
                model.modelId
              );

              return (
                isExtraModel ||
                checkModelAccess({
                  member: v.userMember,
                  modelAccessRoles: model.accessRolesCombined
                })
              );
            })
            .sort((a, b) =>
              a.label > b.label ? 1 : b.label > a.label ? -1 : 0
            )
        )
      ),
      Result.bind('suggestFields', v => {
        let suggestFields: SuggestField[] = [];

        v.modelsForSuggest.forEach(model => {
          model.fields
            .filter(
              field =>
                field.hidden === false &&
                field.fieldClass === 'dimension' &&
                field.result === 'string'
            )
            .forEach(field => {
              let partFieldLabel: string = isDefined(field.groupLabel)
                ? `${field.groupLabel} ${field.label}`
                : field.label;

              let suggestField: SuggestField = {
                modelFieldRef: `${model.modelId}.${field.id}`,
                connectionType: model.connectionType,
                topLabel: model.label,
                partNodeLabel: field.topLabel,
                partFieldLabel: partFieldLabel,
                partLabel: `${model.label} ${field.topLabel} ${partFieldLabel}`,
                fieldClass: field.fieldClass,
                result: field.result
              };

              suggestFields.push(suggestField);
            });
        });

        suggestFields.sort((a, b) =>
          a.fieldClass !== 'dimension' && b.fieldClass === 'dimension'
            ? 1
            : a.fieldClass === 'dimension' && b.fieldClass !== 'dimension'
              ? -1
              : a.fieldClass !== 'filter' && b.fieldClass === 'filter'
                ? 1
                : a.fieldClass === 'filter' && b.fieldClass !== 'filter'
                  ? -1
                  : a.partLabel > b.partLabel
                    ? 1
                    : b.partLabel > a.partLabel
                      ? -1
                      : 0
        );

        return Result.succeed(suggestFields);
      }),
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind('modelPartXs', v =>
        this.modelsService.getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: v.apiUserMember
        })
      ),
      Result.map(
        (v): ToBackendGetSuggestFieldsOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          suggestFields: v.suggestFields
        })
      )
    );
  }
}
