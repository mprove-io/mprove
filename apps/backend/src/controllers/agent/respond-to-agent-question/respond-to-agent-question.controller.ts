import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendRespondToAgentQuestionRequest } from '#common/interfaces/to-backend/agent/to-backend-respond-to-agent-question';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RespondToAgentQuestionController {
  constructor(
    private sessionsService: SessionsService,
    private agentService: AgentService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRespondToAgentQuestion)
  async respondToQuestion(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendRespondToAgentQuestionRequest = request.body;
    let { sessionId, questionId, answers } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    await this.agentService.respondToQuestion({
      sessionId: sessionId,
      nativeSessionId:
        session.createSessionResponse?.nativeSessionId ??
        session.agentSessionId,
      questionId: questionId,
      answers: answers
    });

    let updatedSession: SessionTab = {
      ...session,
      lastActivityTs: Date.now()
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
