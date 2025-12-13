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
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { THROTTLE_TELEMETRY } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '~common/models/server-error';

let axios = require('axios');

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard)
@Throttle(THROTTLE_TELEMETRY)
@Controller()
export class GLogsController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGLogs)
  async gLogs(@Req() request: any, @Res() res: Response) {
    try {
      let body = request.body;

      let hyperdxIngestionApiKey = this.cs.get<
        BackendConfig['backendHyperdxIngestionApiKey']
      >('backendHyperdxIngestionApiKey');

      let backendOtelEndpoint = this.cs.get<
        BackendConfig['backendOtelEndpoint']
      >('backendOtelEndpoint');

      await axios.post(`${backendOtelEndpoint}/v1/logs`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: hyperdxIngestionApiKey
        }
      });

      return res
        .status(HttpStatus.OK)
        .json({ partialSuccess: { rejectedSpans: 0 } });
    } catch (er) {
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_FORWARD_G_LOGS_ERROR,
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
