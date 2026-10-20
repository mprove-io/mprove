import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendSetSessionTitleRequestDto,
  ToBackendSetSessionTitleResponseDto
} from '#backend/controllers/sessions/set-session-title/set-session-title.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EditorOpencodeService } from '#backend/services/editor/editor-opencode/editor-opencode.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import type { GetOpenCodeClientError } from '#common/types/backend/function-errors/get-open-code-client-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetSessionTitleOutput } from '#common/types/backend/routes/sessions/set-session-title/set-session-title-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetSessionTitleController {
  constructor(
    private editorOpencodeService: EditorOpencodeService,
    private explorerStreamService: ExplorerStreamService,
    private db: DbService
  ) {}

  @Post('api/ToBackendSetSessionTitle' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SetSessionTitle',
    description: "Update the session's title"
  })
  @ApiOkResponse({
    type: ToBackendSetSessionTitleResponseDto
  })
  async setSessionTitle(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetSessionTitleRequestDto
  ): Promise<BackendResultForOperation<'setSessionTitle'>> {
    return Result.pipe(
      Result.succeed({
        sessionId: body.input.sessionId,
        title: body.input.title,
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
      Result.andThrough(async v => {
        if (v.session.type === 'Editor') {
          // Type Editor: proxy to OpenCode
          let opencodeClientResult: Result.Result<
            OpencodeClient,
            GetOpenCodeClientError
          > = await this.editorOpencodeService.getOpenCodeClient({
            sessionId: v.sessionId
          });

          if (Result.isFailure(opencodeClientResult)) {
            return opencodeClientResult;
          }

          await opencodeClientResult.value.session.update(
            { sessionID: v.session.opencodeSessionId, title: v.title },
            { throwOnError: true }
          );
        } else {
          // Type Explorer: set title via lock-holding pod (or acquire lock if none)
          await this.explorerStreamService.setTitle({
            sessionId: v.sessionId,
            title: v.title
          });
        }

        return Result.succeed();
      }),
      Result.map((v): ToBackendSetSessionTitleOutput => ({}))
    );
  }
}
