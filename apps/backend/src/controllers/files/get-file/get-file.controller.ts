import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendGetFileRequestDto,
  ToBackendGetFileResponseDto
} from '#backend/controllers/files/get-file/get-file.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { projectTabToBaseProject } from '#backend/functions/db/projects/project-tab-to-base-project/project-tab-to-base-project';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import { checkRepoId } from '#backend/functions/repos/check-repo-id/check-repo-id';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetFileOutput } from '#common/types/backend/routes/files/get-file/get-file-output';

@ApiTags('Files')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetFileController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private db: DbService,
    private cs: ConfigService<BackendConfig>
  ) {}

  @Post('api/ToBackendGetFile' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetFile',
    description: 'Get file'
  })
  @ApiOkResponse({
    type: ToBackendGetFileResponseDto
  })
  async getFile(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetFileRequestDto
  ): Promise<BackendResultForOperation<'getFile'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        fileNodeId: body.input.fileNodeId,
        builderLeft: body.input.builderLeft,
        traceId: body.traceId,
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
      Result.bind('project', v =>
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
      Result.bind('diskGetFileOutput', v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'getFile',
            traceId: v.traceId,
            input: {
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId: v.fileNodeId,
              builderLeft: v.builderLeft
            }
          }
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
          isGetEmptyStructOnError: true,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('modelPartXs', v =>
        getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: memberTabToApi({
            member: v.userMember
          }),
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendGetFileOutput => ({
          repo: v.diskGetFileOutput.repo,
          originalContent: v.diskGetFileOutput.originalContent,
          content: v.diskGetFileOutput.content,
          struct: structTabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          needValidate: v.bridge.needValidate,
          isExist: v.diskGetFileOutput.isExist
        })
      )
    );
  }
}
