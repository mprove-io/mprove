import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteReportRequestDto,
  ToBackendDeleteReportResponseDto
} from '#backend/controllers/reports/delete-report/delete-report.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ProjectTab,
  ReportTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import {
  type ReportsCatalog,
  ReportsService
} from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetReportCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';
import type { GetReportsCatalogError } from '#common/types/backend/function-errors/get-reports-catalog-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteReportOutput } from '#common/types/backend/routes/reports/delete-report/delete-report-output';

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteReportController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private reportsService: ReportsService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private rpcService: RpcService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteReport' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteReport',
    description: 'Delete a report'
  })
  @ApiOkResponse({
    type: ToBackendDeleteReportResponseDto
  })
  async deleteRep(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteReportRequestDto
  ): Promise<BackendResultForOperation<'deleteReport'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        reportId: body.input.reportId,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestrictedResult({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId
        })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'existingReport',
        (
          v
        ): Result.ResultAsync<ReportTab, GetReportCheckExistsAndAccessError> =>
          this.reportsService.getReportCheckExistsAndAccessResult({
            projectId: v.projectId,
            structId: v.bridge.structId,
            reportId: v.reportId,
            userMember: v.userMember,
            user: v.user
          })
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDiskResult({
          request: {
            operation: 'deleteFile',
            traceId: v.traceId,
            input: {
              baseProject: this.tabService.projectTabToBaseProject({
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId: v.existingReport.filePath,
              userAlias: v.user.alias
            }
          }
        })
      ),
      Result.bind(
        'branchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.branch.projectId),
                eq(bridgesTable.repoId, v.branch.repoId),
                eq(bridgesTable.branchId, v.branch.branchId)
              )
            })
            .then(xs => Result.succeed(xs))
      ),
      Result.map(v => {
        v.branchBridgeEnts.forEach(bridgeEnt => {
          if (bridgeEnt.envId !== v.envId) {
            bridgeEnt.structId = EMPTY_STRUCT_ID;

            bridgeEnt.needValidate = true;
          }
        });
        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(async tx => {
                  await tx
                    .delete(reportsTable)
                    .where(
                      and(
                        eq(reportsTable.reportId, v.reportId),
                        eq(reportsTable.structId, v.bridge.structId)
                      )
                    );

                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: { bridges: [...v.branchBridgeEnts] }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'reportsCatalog',
        (v): Result.ResultAsync<ReportsCatalog, GetReportsCatalogError> =>
          this.reportsService.getReportsCatalogResult({
            projectId: v.projectId,
            structId: v.bridge.structId,
            user: v.user,
            userMember: v.userMember,
            apiUserMember: v.apiUserMember,
            spaces: v.struct.spaces
          })
      ),
      Result.map(
        (v): ToBackendDeleteReportOutput => ({
          reportUnitDrafts: v.reportsCatalog.reportUnitDrafts,
          reportSpaceNodes: v.reportsCatalog.reportSpaceNodes
        })
      )
    );
  }
}
