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
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Member } from '#common/zod/backend/member';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendGetProvidersRequestPayload } from '#common/zod/to-backend/providers/get-providers/get-providers-request-payload';
import type { ToBackendGetProvidersResponsePayload } from '#common/zod/to-backend/providers/get-providers/get-providers-response-payload';

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
    let bodyPayload: ToBackendGetProvidersRequestPayload = body.payload;

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

    let payload: ToBackendGetProvidersResponsePayload = {
      userMember: apiUserMember,
      providers: apiProviders
    };

    return payload;
  }
}
