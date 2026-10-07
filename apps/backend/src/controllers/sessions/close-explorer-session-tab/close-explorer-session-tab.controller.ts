import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendCloseExplorerSessionTabRequestDto,
  ToBackendCloseExplorerSessionTabResponseDto
} from '#backend/controllers/sessions/close-explorer-session-tab/close-explorer-session-tab.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CloseExplorerSessionTabController {
  constructor(
    private sessionsService: SessionsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

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
  ) {
    let { sessionId, closedExplorerTabIds } = body.input;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: 'BACKEND_UNAUTHORIZED'
      });
    }

    session.closedExplorerTabIds = [...new Set(closedExplorerTabIds)];

    await this.db.drizzle.transaction(async tx => {
      await this.db.packer.write({
        tx: tx,
        insertOrUpdate: {
          sessions: [session]
        }
      });
    });

    let payload = {};

    return payload;
  }
}
