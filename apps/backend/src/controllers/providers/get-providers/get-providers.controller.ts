import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetProvidersRequestDto,
  ToBackendGetProvidersResponseDto
} from '#backend/controllers/providers/get-providers/get-providers.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type ProviderEnt,
  providersTable
} from '#backend/drizzle/postgres/schema/providers';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { TabService } from '#backend/services/tab.service';
import type { Member } from '#common/types/backend/member';
import type { Provider } from '#common/types/backend/provider';
import type { ToBackendGetProvidersOutput } from '#common/types/backend/routes/providers/get-providers/get-providers-output';
import type { ToBackendGetProvidersRequest } from '#common/types/backend/routes/providers/get-providers/get-providers-request';
import type { ToBackendRoute } from '#common/types/to-backend-route';

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

  @Post('api/ToBackendGetProviders' satisfies ToBackendRoute)
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
    let bodyPayload: ToBackendGetProvidersRequest['input'] = body.input;

    let { projectId } = bodyPayload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember: MemberTab =
      await this.membersService.getMemberCheckIsEditorOrAdmin({
        memberId: user.userId,
        projectId: projectId
      });

    let providerEnts: ProviderEnt[] =
      await this.db.drizzle.query.providersTable.findMany({
        where: eq(providersTable.projectId, projectId)
      });

    let providers: ProviderTab[] = providerEnts.map(providerEnt =>
      this.tabService.providerEntToTab({ providerEnt: providerEnt })
    );

    let sortedProviders: ProviderTab[] = providers.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let apiProviders: Provider[] = await Promise.all(
      sortedProviders.map(provider =>
        this.providersService.tabToApiProvider({
          provider: provider,
          isIncludePasswords: false
        })
      )
    );

    let apiUserMember: Member = this.membersService.tabToApi({
      member: userMember
    });

    let payload: ToBackendGetProvidersOutput = {
      userMember: apiUserMember,
      providers: apiProviders
    };

    return payload;
  }
}
