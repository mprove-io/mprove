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
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { BridgeTab, UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { EMPTY_STRUCT_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendCreateEnvRequest,
  ToBackendCreateEnvResponsePayload
} from '~common/interfaces/to-backend/envs/to-backend-create-env';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateEnvController {
  constructor(
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateEnv)
  async createEnv(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateEnvRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await this.envsService.checkEnvDoesNotExist({
      projectId: projectId,
      envId: envId
    });

    let newEnv = this.envsService.makeEnv({
      projectId: projectId,
      envId: envId,
      evs: []
    });

    let branches = await this.db.drizzle.query.branchesTable.findMany({
      where: eq(branchesTable.projectId, projectId)
    });

    let newBridges: BridgeTab[] = [];

    branches.forEach(x => {
      let newBridge = this.bridgesService.makeBridge({
        projectId: projectId,
        repoId: x.repoId,
        branchId: x.branchId,
        envId: envId,
        structId: EMPTY_STRUCT_ID,
        needValidate: true
      });

      newBridges.push(newBridge);
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                envs: [newEnv],
                bridges: newBridges
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let payload: ToBackendCreateEnvResponsePayload = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      envs: apiEnvs
    };

    return payload;
  }
}
