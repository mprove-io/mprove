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
import { BridgeTab, UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import { ToBackendCreateBranchRequest } from '~common/interfaces/to-backend/branches/to-backend-create-branch';
import {
  ToDiskCreateBranchRequest,
  ToDiskCreateBranchResponse
} from '~common/interfaces/to-disk/05-branches/to-disk-create-branch';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateBranchController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private rpcService: RpcService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private membersService: MembersService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateBranch)
  async createBranch(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateBranchRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, newBranchId, fromBranchId, isRepoProd } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditor({
      memberId: user.userId,
      projectId: projectId
    });

    let fromBranch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: fromBranchId
    });

    await this.branchesService.checkBranchDoesNotExist({
      projectId: projectId,
      repoId: repoId,
      branchId: newBranchId
    });

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskCreateBranchRequest: ToDiskCreateBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        newBranch: newBranchId,
        fromBranch: fromBranchId,
        isFromRemote: false
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskCreateBranchResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskCreateBranchRequest,
        checkIsOk: true
      });

    let newBranch = this.branchesService.makeBranch({
      projectId: projectId,
      repoId: repoId,
      branchId: newBranchId
    });

    let fromBranchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, fromBranch.projectId),
        eq(bridgesTable.repoId, fromBranch.repoId),
        eq(bridgesTable.branchId, fromBranch.branchId)
      )
    });

    let newBranchBridges: BridgeTab[] = [];

    fromBranchBridges.forEach(x => {
      let newBranchBridge = this.bridgesService.makeBridge({
        projectId: newBranch.projectId,
        repoId: newBranch.repoId,
        branchId: newBranch.branchId,
        envId: x.envId,
        structId: EMPTY_STRUCT_ID,
        needValidate: true
      });

      newBranchBridges.push(newBranchBridge);
    });

    await forEachSeries(newBranchBridges, async x => {
      if (x.envId === PROJECT_ENV_PROD) {
        let structId = makeId();

        await this.blockmlService.rebuildStruct({
          traceId: traceId,
          projectId: projectId,
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
              insert: {
                branches: [newBranch],
                bridges: [...newBranchBridges]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
