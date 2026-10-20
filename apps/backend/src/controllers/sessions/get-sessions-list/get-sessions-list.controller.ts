import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  and,
  desc,
  eq,
  gte,
  inArray,
  lt,
  notInArray,
  type SQL
} from 'drizzle-orm';
import {
  ToBackendGetSessionsListRequestDto,
  ToBackendGetSessionsListResponseDto
} from '#backend/controllers/sessions/get-sessions-list/get-sessions-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ProjectTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DbProjectsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import type { DbSessionsFindFirstError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-error';
import type { DbSessionsFindManyError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-many-error';
import type { GetSessionListError } from '#common/types/backend/function-errors/get-session-list-error';
import type { TabsToSessionApisError } from '#common/types/backend/function-errors/tabs-to-session-apis-error';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionType } from '#common/types/backend/parts/session/session-type';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetSessionsListOutput } from '#common/types/backend/routes/sessions/get-sessions-list/get-sessions-list-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSessionsListController {
  constructor(
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetSessionsList' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetSessionsList',
    description: 'List the user sessions'
  })
  @ApiOkResponse({
    type: ToBackendGetSessionsListResponseDto
  })
  async getSessionsList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetSessionsListRequestDto
  ): Promise<BackendResultForOperation<'getSessionsList'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        currentSessionId: body.input.currentSessionId,
        includeArchived: body.input.includeArchived,
        archivedLimit: body.input.archivedLimit,
        archivedLastCreatedTs: body.input.archivedLastCreatedTs,
        sessionType: body.input.sessionType,
        userId: user.userId
      }),
      Result.bind(
        'project',
        (
          v
        ): Result.ResultAsync<
          ProjectTab,
          DbProjectsFindFirstCheckExistsError
        > =>
          this.db.projects.findFirstCheckExists({
            where: eq(projectsTable.projectId, v.projectId)
          })
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind(
        'editorSessions',
        async (v): Result.ResultAsync<SessionTab[], DbSessionsFindManyError> =>
          v.project.e2bApiKey && v.sessionType === 'Editor'
            ? this.db.sessions.findMany({
                where: and(
                  eq(sessionsTable.projectId, v.projectId),
                  eq(sessionsTable.userId, v.userId),
                  eq(sessionsTable.type, 'Editor'),
                  inArray(sessionsTable.status, ['Active', 'Paused'])
                )
              })
            : Result.succeed([])
      ),
      Result.andThrough(async v => {
        if (v.project.e2bApiKey && v.sessionType === 'Editor') {
          await this.editorSandboxService.syncEditorSessionsStatus({
            editorSessions: v.editorSessions,
            e2bApiKey: v.project.e2bApiKey
          });
        }

        return Result.succeed();
      }),
      Result.andThen(
        (
          v
        ): Result.ResultAsync<
          ToBackendGetSessionsListOutput,
          GetSessionListError
        > =>
          this.getSessionList({
            projectId: v.projectId,
            userId: v.userId,
            currentSessionId: v.currentSessionId,
            includeArchived: v.includeArchived,
            archivedLimit: v.archivedLimit,
            archivedLastCreatedTs: v.archivedLastCreatedTs,
            sessionType: v.sessionType
          })
      )
    );
  }

  private async getSessionList(item: {
    projectId: string;
    userId: string;
    currentSessionId?: string;
    includeArchived?: boolean;
    archivedLimit?: number;
    archivedLastCreatedTs?: number;
    sessionType: SessionType;
  }): Result.ResultAsync<ToBackendGetSessionsListOutput, GetSessionListError> {
    return Result.pipe(
      Result.succeed({
        ...item,
        archivedPageLimit: item.archivedLimit ?? 10
      }),
      Result.bind(
        'sessions',
        (v): Result.ResultAsync<SessionTab[], DbSessionsFindManyError> =>
          this.db.sessions.findMany({
            where: and(
              eq(sessionsTable.projectId, v.projectId),
              eq(sessionsTable.userId, v.userId),
              notInArray(sessionsTable.status, ['Deleted', 'Archived']),
              eq(sessionsTable.type, v.sessionType)
            ),
            orderBy: [desc(sessionsTable.createdTs)]
          })
      ),
      Result.bind(
        'baseConditions',
        (v): Result.Result<SQL[], never> =>
          Result.succeed([
            eq(sessionsTable.projectId, v.projectId),
            eq(sessionsTable.userId, v.userId),
            eq(sessionsTable.status, 'Archived'),
            eq(sessionsTable.type, v.sessionType)
          ])
      ),
      // All archived sessions above cursor (previously loaded + newly archived)
      Result.bind(
        'aboveCursorSessions',
        async (v): Result.ResultAsync<SessionTab[], DbSessionsFindManyError> =>
          v.includeArchived === true && isDefined(v.archivedLastCreatedTs)
            ? this.db.sessions.findMany({
                where: and(
                  ...v.baseConditions,
                  gte(sessionsTable.createdTs, v.archivedLastCreatedTs)
                ),
                orderBy: [desc(sessionsTable.createdTs)]
              })
            : Result.succeed([])
      ),
      // Next page below cursor, or first load when no cursor is provided
      Result.bind(
        'archivedPageSessions',
        async (v): Result.ResultAsync<SessionTab[], DbSessionsFindManyError> =>
          v.includeArchived === true
            ? this.db.sessions.findMany({
                where: and(
                  ...v.baseConditions,
                  isDefined(v.archivedLastCreatedTs)
                    ? lt(sessionsTable.createdTs, v.archivedLastCreatedTs)
                    : undefined
                ),
                orderBy: [desc(sessionsTable.createdTs)],
                limit: v.archivedPageLimit + 1
              })
            : Result.succeed([])
      ),
      Result.bind(
        'hasMoreArchived',
        async (v): Result.ResultAsync<boolean, never> =>
          v.includeArchived === true
            ? Result.succeed(
                v.archivedPageSessions.length > v.archivedPageLimit
              )
            : this.db.sessions.isExist({
                where: and(...v.baseConditions)
              })
      ),
      Result.bind(
        'listedSessions',
        (v): Result.Result<SessionTab[], never> =>
          Result.succeed([
            ...v.sessions,
            ...v.aboveCursorSessions,
            ...(v.hasMoreArchived
              ? v.archivedPageSessions.slice(0, v.archivedPageLimit)
              : v.archivedPageSessions)
          ])
      ),
      Result.bind(
        'currentSession',
        async (v): Result.ResultAsync<SessionTab, DbSessionsFindFirstError> => {
          let isCurrentSessionIncluded: boolean = v.listedSessions.some(
            session => session.sessionId === v.currentSessionId
          );

          return v.currentSessionId && isCurrentSessionIncluded === false
            ? this.db.sessions.findFirst({
                where: and(
                  eq(sessionsTable.sessionId, v.currentSessionId),
                  eq(sessionsTable.projectId, v.projectId),
                  eq(sessionsTable.userId, v.userId),
                  eq(sessionsTable.type, v.sessionType)
                )
              })
            : Result.succeed(undefined);
        }
      ),
      Result.bind(
        'apiSessions',
        (v): Result.ResultAsync<SessionApi[], TabsToSessionApisError> =>
          this.sessionsService.tabsToSessionApis({
            sessions: isUndefined(v.currentSession)
              ? v.listedSessions
              : [...v.listedSessions, v.currentSession]
          })
      ),
      Result.map(
        (v): ToBackendGetSessionsListOutput => ({
          sessions: v.apiSessions,
          hasMoreArchived: v.hasMoreArchived
        })
      )
    );
  }
}
