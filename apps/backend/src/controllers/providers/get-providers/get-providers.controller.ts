import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetProvidersRequestDto,
  ToBackendGetProvidersResponseDto
} from '#backend/controllers/providers/get-providers/get-providers.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
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
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { ProviderEntToTabResultError } from '#common/types/backend/function-errors/provider-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProvidersOutput } from '#common/types/backend/routes/providers/get-providers/get-providers-output';

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
  ): Promise<BackendResultForOperation<'getProviders'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        providersService: this.providersService,
        tabService: this.tabService,
        db: this.db
      }),
      Result.andThrough(v =>
        v.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<
          MemberTab,
          GetMemberCheckIsEditorOrAdminResultError
        > =>
          v.membersService.getMemberCheckIsEditorOrAdminResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'providerEnts',
        async (v): Result.ResultAsync<ProviderEnt[], never> => {
          let providerEnts: ProviderEnt[] =
            await v.db.drizzle.query.providersTable.findMany({
              where: eq(providersTable.projectId, v.projectId)
            });

          return Result.succeed(providerEnts);
        }
      ),
      Result.bind(
        'providers',
        (v): Result.Result<ProviderTab[], ProviderEntToTabResultError> =>
          Result.sequence(v.providerEnts, providerEnt =>
            v.tabService.providerEntToTabResult({ providerEnt: providerEnt })
          )
      ),
      Result.map(
        (v): ToBackendGetProvidersOutput => ({
          userMember: v.membersService.tabToApi({ member: v.userMember }),
          providers: v.providers
            .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
            .map(provider =>
              v.providersService.tabToApiProvider({
                provider: provider,
                isIncludePasswords: false
              })
            )
        })
      )
    );
  }
}
