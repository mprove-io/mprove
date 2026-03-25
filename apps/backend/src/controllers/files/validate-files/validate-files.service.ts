import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/get-retry-option';
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
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendValidateFilesResponsePayload } from '#common/interfaces/to-backend/files/to-backend-validate-files';
import type {
  ToDiskGetCatalogFilesRequest,
  ToDiskGetCatalogFilesResponse
} from '#common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-files';

@Injectable()
export class ValidateFilesService {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async validateFiles(item: {
    traceId: string;
    userId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Promise<ToBackendValidateFilesResponsePayload> {
    let { traceId, userId, projectId, repoId, branchId, envId } = item;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: userId,
      projectId: projectId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditor({
      projectId: projectId,
      memberId: userId
    });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: repoId
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

    let toDiskGetCatalogFilesRequest: ToDiskGetCatalogFilesRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
        traceId: traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskGetCatalogFilesResponse>({
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        message: toDiskGetCatalogFilesRequest,
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

    let payload: ToBackendValidateFilesResponsePayload = {
      repo: diskResponse.payload.repo,
      needValidate: currentBridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      })
    };

    return payload;
  }
}
