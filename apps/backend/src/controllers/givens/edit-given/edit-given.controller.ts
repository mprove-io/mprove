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
  ToBackendEditGivenRequestDto,
  ToBackendEditGivenResponseDto
} from '#backend/controllers/givens/edit-given/edit-given.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendEditGivenOutput } from '#common/zod/backend/routes/givens/edit-given/edit-given-output';

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendEditGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditGiven',
    description: 'Edit a project given'
  })
  @ApiOkResponse({
    type: ToBackendEditGivenResponseDto
  })
  async editGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditGivenRequestDto
  ) {
    let { projectId, givenId, values } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let given = await this.givensService.getGivenCheckExists({
      projectId: projectId,
      givenId: givenId
    });

    this.givensService.validateGivenValues({
      type: given.type,
      isMultiple: given.isMultiple === true,
      values: values
    });

    given.values = values;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                givens: [given]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let apiGivens = await this.givensService.getApiGivens({
      projectId: projectId
    });

    let payload: ToBackendEditGivenOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      givens: apiGivens
    };

    return payload;
  }
}
