import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { QueriesService } from '#backend/services/db/queries.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { ParentService } from '#backend/services/parent.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import {
  ToBackendDuplicateMconfigAndQueryRequest,
  ToBackendDuplicateMconfigAndQueryResponsePayload
} from '#common/interfaces/to-backend/mconfigs/to-backend-duplicate-mconfig-and-query';
import { makeQueryId } from '#node-common/functions/make-query-id';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DuplicateMconfigAndQueryController {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDuplicateMconfigAndQuery)
  async duplicateMconfigAndQuery(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendDuplicateMconfigAndQueryRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, envId, oldMconfigId } = reqValid.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

    let project = await this.projectsService.getProjectCheckExists({
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

    await this.envsService.getEnvCheckExistsAndAccess({
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

    let oldMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.structId,
      mconfigId: oldMconfigId
    });

    await this.structsService.getStructCheckExistsAndNotChanged({
      projectId: projectId,
      bridgeStructId: bridge.structId,
      structId: oldMconfig.structId
    });

    await this.parentService.checkAccess({
      parentId: oldMconfig.parentId,
      parentType: oldMconfig.parentType,
      modelId: oldMconfig.modelId,
      user: user,
      userMember: userMember,
      structId: bridge.structId,
      projectId: projectId
    });

    // user can see dashboard tile or report metric without model access - OK
    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: oldMconfig.modelId
    });

    let oldQuery = await this.db.drizzle.query.queriesTable
      .findFirst({
        where: and(
          eq(queriesTable.queryId, oldMconfig.queryId),
          eq(queriesTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.queryEntToTab(x));

    let newMconfigId = makeId();

    let newMconfigParentType =
      oldMconfig.parentType === MconfigParentTypeEnum.Dashboard
        ? MconfigParentTypeEnum.ChartDialogDashboard
        : oldMconfig.parentType === MconfigParentTypeEnum.Report
          ? MconfigParentTypeEnum.ChartDialogReport
          : oldMconfig.parentType;

    let newQueryId = makeQueryId({
      projectId: project.projectId,
      connectionId: model.connectionId,
      envId: envId,
      mconfigParentType: newMconfigParentType,
      mconfigParentId: oldMconfig.parentId,
      sql: oldQuery.sql,
      store: model.storeContent,
      storeTransformedRequestString: oldMconfig.storePart?.reqJsonParts
    });

    let newMconfig = Object.assign({}, oldMconfig, <MconfigTab>{
      mconfigId: newMconfigId,
      queryId: newQueryId,
      parentType: newMconfigParentType
    });

    let newQuery = Object.assign({}, oldQuery, <QueryTab>{
      queryId: newQueryId
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: [newMconfig]
              },
              insertOrUpdate: {
                queries: [newQuery]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendDuplicateMconfigAndQueryResponsePayload = {
      mconfig: this.mconfigsService.tabToApi({
        mconfig: newMconfig,
        modelFields: model.fields
      }),
      query: this.queriesService.tabToApi({ query: newQuery })
    };

    return payload;
  }
}
