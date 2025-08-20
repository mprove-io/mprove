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
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendRevertRepoToLastCommitRequest,
  ToBackendRevertRepoToLastCommitResponsePayload
} from '~common/interfaces/to-backend/repos/to-backend-revert-repo-to-last-commit';
import {
  ToDiskRevertRepoToLastCommitRequest,
  ToDiskRevertRepoToLastCommitResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-revert-repo-to-last-commit';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class RevertRepoToLastCommitController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private structsService: StructsService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRevertRepoToLastCommit)
  async revertRepoToLastCommit(
    @AttachUser() user: UserEnt,
    @Req() request: any
  ) {
    let reqValid: ToBackendRevertRepoToLastCommitRequest = request.body;

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
      repoId: user.userId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let toDiskRevertRepoToLastCommitRequest: ToDiskRevertRepoToLastCommitRequest =
      {
        info: {
          name: ToDiskRequestInfoNameEnum.ToDiskRevertRepoToLastCommit,
          traceId: reqValid.info.traceId
        },
        payload: {
          orgId: project.orgId,
          projectId: projectId,
          repoId: repoId,
          branch: branchId,
          remoteType: project.remoteType,
          gitUrl: project.gitUrl,
          privateKey: project.privateKey,
          publicKey: project.publicKey
        }
      };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskRevertRepoToLastCommitResponse>(
        {
          routingKey: makeRoutingKeyToDisk({
            orgId: project.orgId,
            projectId: projectId
          }),
          message: toDiskRevertRepoToLastCommitRequest,
          checkIsOk: true
        }
      );

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

    let payload: ToBackendRevertRepoToLastCommitResponsePayload = {
      repo: diskResponse.payload.repo,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      needValidate: currentBridge.needValidate
    };

    return payload;
  }
}
