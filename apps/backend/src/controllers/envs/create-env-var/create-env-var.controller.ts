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
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { Ev } from '~common/interfaces/backend/ev';
import {
  ToBackendCreateEnvVarRequest,
  ToBackendCreateEnvVarResponsePayload
} from '~common/interfaces/to-backend/envs/to-backend-create-env-var';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateEnvVarController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateEnvVar)
  async createEnvVar(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCreateEnvVarRequest = request.body;

    let { projectId, envId, evId, val } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<BackendConfig['firstProjectId']>('firstProjectId');

    if (userMember.isAdmin === false && projectId === firstProjectId) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let ev = env.evs.find(x => x.evId === evId);

    if (isDefined(ev)) {
      throw new ServerError({
        message: ErEnum.BACKEND_EV_ALREADY_EXISTS
      });
    }

    let newEv: Ev = {
      evId: evId,
      val: val
    };

    env.evs.push(newEv);

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, projectId),
        eq(bridgesTable.envId, envId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      x.needValidate = true;
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                bridges: [...branchBridges],
                envs: [env]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let payload: ToBackendCreateEnvVarResponsePayload = {
      userMember: this.wrapToApiService.wrapToApiMember(userMember),
      envs: apiEnvs
    };

    return payload;
  }
}
