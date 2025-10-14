import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { checkAccess } from '~backend/functions/check-access';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { ReportsService } from '~backend/services/db/reports.service';
import { StructsService } from '~backend/services/db/structs.service';
import { TabService } from '~backend/services/tab.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetReportsRequest,
  ToBackendGetReportsResponsePayload
} from '~common/interfaces/to-backend/reports/to-backend-get-reports';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetReportsController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private reportsService: ReportsService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetReports)
  async getReports(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetReportsRequest = request.body;

    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

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

    let draftReports = await this.db.drizzle.query.reportsTable
      .findMany({
        where: and(
          eq(reportsTable.draft, true),
          eq(reportsTable.creatorId, user.userId),
          eq(reportsTable.structId, bridge.structId)
        )
      })
      .then(xs => xs.map(x => this.tabService.reportEntToTab(x)));

    let structReports = await this.db.drizzle.query.reportsTable
      .findMany({
        where: and(
          eq(reportsTable.draft, false),
          eq(reportsTable.structId, bridge.structId)
        )
      })
      .then(xs => xs.map(x => this.tabService.reportEntToTab(x)));

    let reportsGrantedAccess = structReports.filter(x =>
      checkAccess({
        member: userMember,
        accessRoles: x.accessRoles
      })
    );

    let reports = [
      ...draftReports
        .sort((a, b) =>
          a.draftCreatedTs > b.draftCreatedTs
            ? 1
            : b.draftCreatedTs > a.draftCreatedTs
              ? -1
              : 0
        )
        .reverse(),
      ...reportsGrantedAccess.sort((a, b) => {
        let aTitle = a.title.toLowerCase() || a.reportId.toLowerCase();
        let bTitle = b.title.toLowerCase() || a.reportId.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      })
    ];

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
      // skipMetrics: false
    });

    let modelIds = struct.metrics
      .filter(m => isDefined(m.modelId))
      .map(x => x.modelId);

    let models = await this.db.drizzle.query.modelsTable
      .findMany({
        where: and(
          inArray(modelsTable.modelId, modelIds),
          eq(modelsTable.structId, struct.structId)
        )
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiModels = models.map(model =>
      this.modelsService.tabToApi({
        model: model,
        hasAccess: checkModelAccess({
          member: userMember,
          modelAccessRoles: model.accessRoles
        })
      })
    );

    let payload: ToBackendGetReportsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiUserMember,
      reports: reports.map(x =>
        this.reportsService.tabToApi({
          report: x,
          member: apiUserMember,
          columns: [],
          models: apiModels,
          timezone: undefined,
          timeSpec: undefined,
          timeRangeFraction: undefined,
          rangeStart: undefined,
          rangeEnd: undefined,
          metricsStartDateYYYYMMDD: undefined,
          metricsEndDateExcludedYYYYMMDD: undefined,
          metricsEndDateIncludedYYYYMMDD: undefined,
          timeColumnsLimit: undefined,
          timeColumnsLength: undefined,
          isTimeColumnsLimitExceeded: false
        })
      ),
      storeModels: apiModels.filter(model => model.type === ModelTypeEnum.Store)
    };

    return payload;
  }
}
