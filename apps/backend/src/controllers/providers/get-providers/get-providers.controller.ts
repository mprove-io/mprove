import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetProvidersRequestDto,
  ToBackendGetProvidersResponseDto
} from '#backend/controllers/providers/get-providers/get-providers.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetProvidersResponsePayload } from '#common/zod/to-backend/providers/to-backend-get-providers';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProvidersController {
  constructor(
    private tabService: TabService,
    private providersService: ProvidersService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetProviders)
  @ApiOperation({
    summary: 'GetProviders',
    description: 'Get project providers'
  })
  @ApiOkResponse({
    type: ToBackendGetProvidersResponseDto
  })
  async getProviders(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetProvidersRequestDto
  ) {
    let { projectId } = body.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let providers = await this.db.drizzle.query.providersTable
      .findMany({
        where: eq(providersTable.projectId, projectId)
      })
      .then(providerEnts =>
        providerEnts.map(providerEnt =>
          this.tabService.providerEntToTab({ providerEnt: providerEnt })
        )
      );

    let payload: ToBackendGetProvidersResponsePayload = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      providers: providers
        .sort((a, b) =>
          a.providerId > b.providerId ? 1 : b.providerId > a.providerId ? -1 : 0
        )
        .map(provider =>
          this.providersService.tabToApiProvider({
            provider: provider,
            isIncludePasswords: false
          })
        )
    };

    return payload;
  }
}
