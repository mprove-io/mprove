import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, asc, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetBranchesListRequestDto,
  ToBackendGetBranchesListResponseDto
} from '#backend/controllers/branches/get-branches-list/get-branches-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  OcSessionTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BranchEnt,
  branchesTable
} from '#backend/drizzle/postgres/schema/branches';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import {
  type SessionEnt,
  sessionsTable
} from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROD_REPO_ID } from '#common/constants/top';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { OcSessionEntToTabResultError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-result-error';
import type { SessionEntToTabResultError } from '#common/types/backend/function-errors/session-ent-to-tab-result-error';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetBranchesListOutput } from '#common/types/backend/routes/branches/get-branches-list/get-branches-list-output';

@ApiTags('Branches')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetBranchesListController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'sessionEnts',
        (v): Result.ResultAsync<SessionEnt[], never> =>
          this.db.drizzle.query.sessionsTable
            .findMany({
              where: and(
                eq(sessionsTable.userId, v.userId),
                eq(sessionsTable.projectId, v.projectId)
              )
            })
            .then(sessionEnts => Result.succeed(sessionEnts))
      ),
      Result.bind(
        'repoIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([
            PROD_REPO_ID,
            v.userId,
            ...v.sessionEnts.map(sessionEnt => sessionEnt.repoId)
          ])
      ),
      Result.bind(
        'branchEnts',
        (v): Result.ResultAsync<BranchEnt[], never> =>
          this.db.drizzle.query.branchesTable
            .findMany({
              where: and(
                eq(branchesTable.projectId, v.projectId),
                inArray(branchesTable.repoId, v.repoIds)
              ),
              orderBy: asc(branchesTable.branchId)
            })
            .then(branchEnts => Result.succeed(branchEnts))
      ),
      Result.bind(
        'uniqueBranchEnts',
        (v): Result.Result<BranchEnt[], never> => {
          let seen: Record<string, boolean> = {};

          let uniqueBranchEnts: BranchEnt[] = v.branchEnts.filter(branchEnt => {
            let key: string = `${branchEnt.repoId}::${branchEnt.branchId}`;

            if (seen[key]) {
              return false;
            }

            seen[key] = true;

            return true;
          });

          return Result.succeed(uniqueBranchEnts);
        }
      ),
      Result.bind(
        'sessionIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.sessionEnts.map(sessionEnt => sessionEnt.sessionId))
      ),
      Result.bind(
        'ocSessions',
        async (
          v
        ): Result.ResultAsync<OcSessionTab[], OcSessionEntToTabResultError> =>
          v.sessionIds.length > 0
            ? this.db.drizzle.query.ocSessionsTable
                .findMany({
                  where: inArray(ocSessionsTable.sessionId, v.sessionIds)
                })
                .then(ocSessionEnts =>
                  Result.sequence(ocSessionEnts, ocSessionEnt =>
                    this.tabService.ocSessionEntToTabResult({
                      ocSessionEnt: ocSessionEnt
                    })
                  )
                )
            : Result.succeed([])
      ),
      Result.bind(
        'sessions',
        (v): Result.Result<SessionTab[], SessionEntToTabResultError> =>
          Result.sequence(v.sessionEnts, sessionEnt =>
            this.tabService.sessionEntToTabResult({
              sessionEnt: sessionEnt
            })
          )
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
          branchesList: v.uniqueBranchEnts.map(branchEnt => ({
            repoId: branchEnt.repoId,
            repoType:
              branchEnt.repoId === PROD_REPO_ID
                ? 'production'
                : branchEnt.repoId === v.userId
                  ? 'dev'
                  : 'session',
            branchId: branchEnt.branchId
          }))
        })
      )
    );
  }
}
