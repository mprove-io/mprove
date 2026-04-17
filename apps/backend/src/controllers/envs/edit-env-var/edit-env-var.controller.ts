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
  ToBackendEditEnvVarRequestDto,
  ToBackendEditEnvVarResponseDto
} from '#backend/controllers/envs/edit-env-var/edit-env-var.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendEditEnvVarResponsePayload } from '#common/zod/to-backend/envs/to-backend-edit-env-var';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditEnvVarController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditEnvVar)
  @ApiOperation({
    summary: 'EditEnvVar',
    description: 'Update the value of an environment variable'
  })
  @ApiOkResponse({
    type: ToBackendEditEnvVarResponseDto
  })
  async editEnvVar(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditEnvVarRequestDto
  ) {
    let { projectId, envId, evId, val } = body.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: undefined
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let ev = env.evs.find(x => x.evId === evId);

    if (isUndefined(ev)) {
      throw new ServerError({
        message: ErEnum.BACKEND_EV_DOES_NOT_EXIST
      });
    }

    ev.val = val;

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
        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              bridges: [...branchBridges],
              envs: [env]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let payload: ToBackendEditEnvVarResponsePayload = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      envs: apiEnvs
    };

    return payload;
  }
}
