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
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendEditMemberRequestDto,
  ToBackendEditMemberResponseDto
} from '#backend/controllers/members/edit-member/edit-member.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  AvatarTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/schema/avatars';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AvatarEntToTabResultError } from '#common/types/backend/function-errors/avatar-ent-to-tab-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditMemberOutput } from '#common/types/backend/routes/members/edit-member/edit-member-output';

@ApiTags('Members')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditMemberController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendEditMember' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditMember',
    description: "Update a member's roles"
  })
  @ApiOkResponse({
    type: ToBackendEditMemberResponseDto
  })
  async editMember(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditMemberRequestDto
  ): Promise<BackendResultForOperation<'editMember'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        memberId: body.input.memberId,
        isAdmin: body.input.isAdmin,
        isEditor: body.input.isEditor,
        isExplorer: body.input.isExplorer,
        roles: body.input.roles,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdminResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        v.memberId === v.userId && v.isAdmin === false
          ? Result.fail({
              code: 'BACKEND_ADMIN_CANNOT_CHANGE_HIS_ADMIN_STATUS'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.rolesService.checkRolesExistResult({
          projectId: v.projectId,
          roleIds: v.roles
        })
      ),
      Result.bind(
        'member',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            memberId: v.memberId,
            projectId: v.projectId
          })
      ),
      Result.inspect(v => {
        v.member.isAdmin = v.isAdmin;
        v.member.isEditor = v.isEditor;
        v.member.isExplorer = v.isExplorer;
        v.member.roles = v.roles;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        members: [v.member]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind(
        'avatars',
        (v): Result.ResultAsync<AvatarTab[], AvatarEntToTabResultError> =>
          this.db.drizzle
            .select({
              keyTag: avatarsTable.keyTag,
              userId: avatarsTable.userId,
              st: avatarsTable.st
              // lt: {},
            })
            .from(avatarsTable)
            .where(eq(avatarsTable.userId, v.member.memberId))
            .then(avatarEnts =>
              Result.sequence(avatarEnts, avatarEnt =>
                this.tabService.avatarEntToTabResult({
                  avatarEnt: avatarEnt as AvatarEnt
                })
              )
            )
      ),
      Result.bind('apiMember', (v): Result.Result<Member, never> => {
        let avatar: AvatarTab = v.avatars.length > 0 ? v.avatars[0] : undefined;

        let apiMember: Member = this.membersService.tabToApi({
          member: v.member
        });

        if (isDefined(avatar)) {
          apiMember.avatarSmall = avatar.avatarSmall;
        }

        return Result.succeed(apiMember);
      }),
      Result.map((v): ToBackendEditMemberOutput => ({ member: v.apiMember }))
    );
  }
}
