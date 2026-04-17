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
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetProjectInfoRequestDto,
  ToBackendSetProjectInfoResponseDto
} from '#backend/controllers/projects/set-project-info/set-project-info.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ToBackendSetProjectInfoResponsePayload } from '#common/zod/to-backend/projects/to-backend-set-project-info';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetProjectInfoController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo)
  @ApiOperation({
    summary: 'SetProjectInfo',
    description: "Update a project's info"
  })
  @ApiOkResponse({
    type: ToBackendSetProjectInfoResponseDto
  })
  async setProjectInfo(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetProjectInfoRequestDto
  ) {
    let { projectId, name } = body.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      projectId: projectId,
      memberId: user.userId
    });

    if (isDefined(name)) {
      project.name = name;
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                projects: [project]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetProjectInfoResponsePayload = {
      project: this.projectsService.tabToApiProject({
        project: project,
        isAddPublicKey: userMember.isAdmin,
        isAddGitUrl: userMember.isAdmin
      })
    };

    return payload;
  }
}
