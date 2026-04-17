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
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteFileRequestDto,
  ToBackendDeleteFileResponseDto
} from '#backend/controllers/files/delete-file/delete-file.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { BlockmlService } from '#backend/services/blockml.service';
import { BranchesService } from '#backend/services/db/branches.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendDeleteFileResponsePayload } from '#common/zod/to-backend/files/to-backend-delete-file';
import type {
  ToDiskDeleteFileRequest,
  ToDiskDeleteFileResponse
} from '#common/zod/to-disk/07-files/to-disk-delete-file';

@ApiTags('Files')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteFileController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private sessionsService: SessionsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteFile)
  @ApiOperation({
    summary: 'DeleteFile',
    description: 'Delete a file'
  })
  @ApiOkResponse({
    type: ToBackendDeleteFileResponseDto
  })
  async deleteFile(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteFileRequestDto
  ) {
    let { traceId } = body.info;
    let { projectId, repoId, branchId, envId, fileNodeId } = body.payload;

    await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: false
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditor({
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

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskDeleteFileRequest: ToDiskDeleteFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteFile,
        traceId: body.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: fileNodeId,
        userAlias: user.alias
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskDeleteFileResponse>({
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        message: toDiskDeleteFileRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      if (x.envId === envId) {
        let structId = makeId();

        await this.blockmlService.rebuildStruct({
          traceId: traceId,
          orgId: project.orgId,
          projectId: projectId,
          repoId: repoId,
          structId: structId,
          diskFiles: diskResponse.payload.files,
          mproveDir: diskResponse.payload.mproveDir,
          envId: x.envId,
          overrideTimezone: undefined
        });

        x.structId = structId;
        x.needValidate = false;
      } else {
        x.structId = EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                bridges: [...branchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let currentBridge = branchBridges.find(y => y.envId === envId);

    let struct = await this.structsService.getStructCheckExists({
      structId: currentBridge.structId,
      projectId: projectId
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendDeleteFileResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      needValidate: currentBridge.needValidate
    };

    return payload;
  }
}
