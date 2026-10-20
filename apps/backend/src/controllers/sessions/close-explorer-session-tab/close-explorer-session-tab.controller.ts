import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendCloseExplorerSessionTabRequestDto,
  ToBackendCloseExplorerSessionTabResponseDto
} from '#backend/controllers/sessions/close-explorer-session-tab/close-explorer-session-tab.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCloseExplorerSessionTabOutput } from '#common/types/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CloseExplorerSessionTabController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendCloseExplorerSessionTab' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CloseExplorerSessionTab',
    description: 'Persist hidden explorer chart tabs for a session'
  })
  @ApiOkResponse({
    type: ToBackendCloseExplorerSessionTabResponseDto
  })
  async closeExplorerSessionTab(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCloseExplorerSessionTabRequestDto
  ): Promise<BackendResultForOperation<'closeExplorerSessionTab'>> {
    return Result.pipe(
      Result.succeed({
        sessionId: body.input.sessionId,
        closedExplorerTabIds: body.input.closedExplorerTabIds,
        userId: user.userId
      }),
      Result.bind(
        'session',
        (
          v
        ): Result.ResultAsync<
          SessionTab,
          DbSessionsFindFirstCheckExistsError
        > =>
          this.db.sessions.findFirstCheckExists({
            where: eq(sessionsTable.sessionId, v.sessionId)
          })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.userId
          ? Result.fail({ code: 'BACKEND_UNAUTHORIZED' })
          : Result.succeed()
      ),
      Result.map(v => {
        v.session.closedExplorerTabIds = [...new Set(v.closedExplorerTabIds)];
        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await this.db.writeUnwrap({
              insertOrUpdate: { sessions: [v.session] }
            });
          }
        })
      ),
      Result.map((v): ToBackendCloseExplorerSessionTabOutput => ({}))
    );
  }
}
