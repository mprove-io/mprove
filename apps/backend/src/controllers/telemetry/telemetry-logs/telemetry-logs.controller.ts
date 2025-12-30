import {
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { THROTTLE_TELEMETRY } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '~common/models/server-error';

let axios = require('axios');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_TELEMETRY)
@Controller()
export class TelemetryLogsController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendTelemetryLogs)
  async telemetryLogs(
    @AttachUser() user: UserTab,
    @Req() request: any,
    @Res() res: Response
  ) {
    try {
      if (!user) {
        // console.log('skip ToBackendTelemetryLogs controller');

        return res
          .status(HttpStatus.OK)
          .json({ partialSuccess: { rejectedSpans: 0 } });
      }

      let body = request.body;

      let backendIsForwardTelemetryEnabled = this.cs.get<
        BackendConfig['backendIsForwardTelemetryEnabled']
      >('backendIsForwardTelemetryEnabled');

      if (backendIsForwardTelemetryEnabled === false) {
        return res
          .status(HttpStatus.OK)
          .json({ partialSuccess: { rejectedSpans: 0 } });
      }

      await axios.post(`${process.env.TELEMETRY_ENDPOINT}/v1/logs`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.TELEMETRY_HYPERDX_INGEST_API_KEY
        }
      });

      return res
        .status(HttpStatus.OK)
        .json({ partialSuccess: { rejectedSpans: 0 } });
    } catch (er) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_FORWARD_TELEMETRY_LOGS_ERROR,
          originalError: er
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      return res
        .status(HttpStatus.OK) // avoid otel retry on front
        .json({});
    }
  }
}
