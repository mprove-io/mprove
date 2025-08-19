import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { MakerService } from '~backend/services/maker.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateBranchController {
  constructor(
    private makerService: MakerService,
    private projectsService: ProjectsService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateBranch)
  async createBranch(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendCreateBranchRequest = request.body;

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

    let toDiskCreateBranchRequest: apiToDisk.ToDiskCreateBranchRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateBranch,
        traceId: traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        newBranch: newBranchId,
        fromBranch: fromBranchId,
        isFromRemote: false,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateBranchResponse>(
        {
          routingKey: makeRoutingKeyToDisk({
            orgId: project.orgId,
            projectId: projectId
          }),
          message: toDiskCreateBranchRequest,
          checkIsOk: true
        }
      );

    let newBranch = this.makerService.makeBranch({
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

    let newBranchBridges: BridgeEnt[] = [];

    fromBranchBridges.forEach(x => {
      let newBranchBridge = this.makerService.makeBridge({
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
