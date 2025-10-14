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
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { StructsService } from '~backend/services/db/structs.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { TabService } from '~backend/services/tab.service';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendPushRepoRequest,
  ToBackendPushRepoResponsePayload
} from '~common/interfaces/to-backend/repos/to-backend-push-repo';
import {
  ToDiskPushRepoRequest,
  ToDiskPushRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-push-repo';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class PushRepoController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendPushRepo)
  async pushRepo(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendPushRepoRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditor({
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
      member: member
    });

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      member.isAdmin === false && // no check for repoId
      projectId === demoProjectId
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskPushRepoRequest: ToDiskPushRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskPushRepo,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskPushRepoResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskPushRepoRequest,
        checkIsOk: true
      });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    let prodBranch = await this.db.drizzle.query.branchesTable
      .findFirst({
        where: and(
          eq(branchesTable.projectId, projectId),
          eq(branchesTable.repoId, PROD_REPO_ID),
          eq(branchesTable.branchId, branchId)
        )
      })
      .then(x => this.tabService.branchEntToTab(x));

    let prodBranchBridges = await this.db.drizzle.query.bridgesTable
      .findMany({
        where: and(
          eq(bridgesTable.projectId, branch.projectId),
          eq(bridgesTable.repoId, PROD_REPO_ID),
          eq(bridgesTable.branchId, branch.branchId)
        )
      })
      .then(xs => xs.map(x => this.tabService.bridgeEntToTab(x)));

    if (isUndefined(prodBranch)) {
      prodBranch = this.branchesService.makeBranch({
        projectId: projectId,
        repoId: PROD_REPO_ID,
        branchId: branchId
      });

      branchBridges.forEach(x => {
        let prodBranchBridge = this.bridgesService.makeBridge({
          projectId: branch.projectId,
          repoId: PROD_REPO_ID,
          branchId: branch.branchId,
          envId: x.envId,
          structId: EMPTY_STRUCT_ID,
          needValidate: true
        });

        prodBranchBridges.push(prodBranchBridge);
      });
    }

    await forEachSeries(prodBranchBridges, async x => {
      if (x.envId === envId) {
        let structId = makeId();

        await this.blockmlService.rebuildStruct({
          traceId: traceId,
          projectId: projectId,
          structId: structId,
          diskFiles: diskResponse.payload.productionFiles,
          mproveDir: diskResponse.payload.productionMproveDir,
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
                branches: [prodBranch],
                bridges: [...prodBranchBridges]
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

    let payload: ToBackendPushRepoResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: this.structsService.tabToApi({ struct: struct }),
      needValidate: currentBridge.needValidate
    };

    return payload;
  }
}
