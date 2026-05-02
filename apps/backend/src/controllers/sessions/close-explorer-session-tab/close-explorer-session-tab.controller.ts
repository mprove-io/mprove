import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendCloseExplorerSessionTabRequestDto,
  ToBackendCloseExplorerSessionTabResponseDto
} from '#backend/controllers/sessions/close-explorer-session-tab/close-explorer-session-tab.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CloseExplorerSessionTabController {
  constructor(
    private sessionsService: SessionsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCloseExplorerSessionTab)
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
    let { sessionId, closedExplorerTabIds } = body.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
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
