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
import axios from 'axios';
import type { Response } from 'express';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { THROTTLE_TELEMETRY } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_TELEMETRY)
@Controller()
export class TelemetryTracesController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendTelemetryTraces)
  async telemetryTraces(
    @AttachUser() user: UserTab,
    @Req() request: any,
    @Res() res: Response
  ) {
    try {
      if (!user) {
        // console.log('skip ToBackendTelemetryTraces controller')

        return res
          .status(HttpStatus.OK)
          .json({ partialSuccess: { rejectedSpans: 0 } });
      }

      let backendIsForwardTelemetryEnabled = this.cs.get<
        BackendConfig['backendIsForwardTelemetryEnabled']
      >('backendIsForwardTelemetryEnabled');

      if (backendIsForwardTelemetryEnabled === false) {
        return res
          .status(HttpStatus.OK)
          .json({ partialSuccess: { rejectedSpans: 0 } });
      }

      let body = request.body;

      if (body?.resourceSpans) {
        for (const rs of body.resourceSpans) {
          rs.resource?.attributes?.push({
            key: 'enduser.id',
            value: { stringValue: user.userId }
          });
        }
      }

      await axios.post(`${process.env.TELEMETRY_ENDPOINT}/v1/traces`, body, {
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
          message: ErEnum.BACKEND_FORWARD_TELEMETRY_TRACES_ERROR,
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
