import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, asc, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetBranchesListRequestDto,
  ToBackendGetBranchesListResponseDto
} from '#backend/controllers/branches/get-branches-list/get-branches-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  MemberTab,
  OcSessionTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROD_REPO_ID } from '#common/constants/top';
import type { DbBranchesFindManyError } from '#common/types/backend/function-errors/db/branches/db-branches-find-many-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { DbOcSessionsFindManyError } from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-many-error';
import type { DbSessionsFindManyError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-many-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetBranchesListOutput } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetBranchesListController {
  constructor(
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetBranchesList' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetBranchesList',
    description: 'Get branches available to the user'
  })
  @ApiOkResponse({
    type: ToBackendGetBranchesListResponseDto
  })
  async getBranchesList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetBranchesListRequestDto
  ): Promise<BackendResultForOperation<'getBranchesList'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<MemberTab, DbMembersFindFirstCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.bind(
        'sessions',
        (v): Result.ResultAsync<SessionTab[], DbSessionsFindManyError> =>
          this.db.sessions.findMany({
            where: and(
              eq(sessionsTable.userId, v.userId),
              eq(sessionsTable.projectId, v.projectId)
            )
          })
      ),
      Result.bind(
        'repoIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([
            PROD_REPO_ID,
            v.userId,
            ...v.sessions.map(session => session.repoId)
          ])
      ),
      Result.bind(
        'branches',
        (v): Result.ResultAsync<BranchTab[], DbBranchesFindManyError> =>
          this.db.branches.findMany({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              inArray(branchesTable.repoId, v.repoIds)
            ),
            orderBy: asc(branchesTable.branchId)
          })
      ),
      Result.bind('uniqueBranches', (v): Result.Result<BranchTab[], never> => {
        let seen: Record<string, boolean> = {};

        let uniqueBranches: BranchTab[] = v.branches.filter(branch => {
          let key: string = `${branch.repoId}::${branch.branchId}`;

          if (seen[key]) {
            return false;
          }

          seen[key] = true;

          return true;
        });

        return Result.succeed(uniqueBranches);
      }),
      Result.bind(
        'sessionIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.sessions.map(session => session.sessionId))
      ),
      Result.bind(
        'ocSessions',
        async (
          v
        ): Result.ResultAsync<OcSessionTab[], DbOcSessionsFindManyError> =>
          v.sessionIds.length > 0
            ? this.db.ocSessions.findMany({
                where: inArray(ocSessionsTable.sessionId, v.sessionIds)
              })
            : Result.succeed([])
      ),
      Result.bind(
        'ocSessionsById',
        (v): Result.Result<Record<string, OcSessionTab>, never> =>
          Result.succeed(
            Object.fromEntries(
              v.ocSessions.map(ocSession => [ocSession.sessionId, ocSession])
            )
          )
      ),
      Result.map(
        (v): ToBackendGetBranchesListOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          sessionsList: v.sessions.map(session =>
            this.sessionsService.tabToSessionApi({
              session: session,
              ocSession: v.ocSessionsById[session.sessionId]
            })
          ),
          branchesList: v.uniqueBranches.map(branch => ({
            repoId: branch.repoId,
            repoType:
              branch.repoId === PROD_REPO_ID
                ? 'production'
                : branch.repoId === v.userId
                  ? 'dev'
                  : 'session',
            branchId: branch.branchId
          }))
        })
      )
    );
  }
}
