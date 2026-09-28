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
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendEditEnvFallbacksRequestDto,
  ToBackendEditEnvFallbacksResponseDto
} from '#backend/controllers/envs/edit-env-fallbacks/edit-env-fallbacks.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendEditEnvFallbacksOutput } from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-output';

const { forEachSeries } = pIteration;

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditEnvFallbacksController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendEditEnvFallbacks' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditEnvFallbacks',
    description: 'Update production fallback for an environment'
  })
  @ApiOkResponse({
    type: ToBackendEditEnvFallbacksResponseDto
  })
  async editEnvFallbacks(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditEnvFallbacksRequestDto
  ) {
    let {
      projectId,
      envId,
      isFallbackToProdConnections,
      isFallbackToProdVariables,
      useProdCache
    } = body.input;

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

    env.isFallbackToProdConnections = isFallbackToProdConnections;
    env.isFallbackToProdVariables = isFallbackToProdVariables;
    env.useProdCache = useProdCache;

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

    let payload: ToBackendEditEnvFallbacksOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      envs: apiEnvs
    };

    return payload;
  }
}
