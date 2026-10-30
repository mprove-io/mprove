import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendGetSuggestFieldsRequestDto,
  ToBackendGetSuggestFieldsResponseDto
} from '#backend/controllers/suggest-fields/get-suggest-fields/get-suggest-fields.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import type { DashboardTab } from '#backend/drizzle/postgres/tables/dashboards';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { ReportTab } from '#backend/drizzle/postgres/tables/reports';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { getDashboardCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-check-exists-and-access/get-dashboard-check-exists-and-access';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { getReportCheckExistsAndAccess } from '#backend/functions/db/reports/get-report-check-exists-and-access/get-report-check-exists-and-access';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
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
    private db: DbService,
    private cs: ConfigService<BackendConfig>
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
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
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
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
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
          ? getReportCheckExistsAndAccess({
              projectId: v.projectId,
              reportId: v.parentId,
              structId: v.bridge.structId,
              userMember: v.userMember,
              user: v.user,
              db: this.db
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
        Result.succeed(
          memberTabToApi({
            member: v.userMember
          })
        )
      ),
      Result.bind('modelPartXs', v =>
        getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: v.apiUserMember,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendGetSuggestFieldsOutput => ({
          needValidate: v.bridge.needValidate,
          struct: structTabToApi({
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
