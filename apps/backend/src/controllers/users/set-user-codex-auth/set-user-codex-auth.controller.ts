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
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { UsersService } from '#backend/services/db/users.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendSetUserCodexAuthRequest,
  ToBackendSetUserCodexAuthResponsePayload
} from '#common/interfaces/to-backend/users/to-backend-set-user-codex-auth';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetUserCodexAuthController {
  constructor(
    private usersService: UsersService,
    private editorCodexService: EditorCodexService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetUserCodexAuth)
  async setUserCodexAuth(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetUserCodexAuthRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { authJson } = reqValid.payload;

    let parsed: any;
    try {
      parsed = JSON.parse(authJson);
    } catch {
      throw new ServerError({
        message: ErEnum.BACKEND_INVALID_CODEX_AUTH_JSON
      });
    }

    let openaiAuth = parsed?.openai;

    if (!openaiAuth || openaiAuth.type !== 'oauth') {
      throw new ServerError({
        message: ErEnum.BACKEND_INVALID_CODEX_AUTH_JSON
      });
    }

    let refreshToken = openaiAuth.refresh;

    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new ServerError({
        message: ErEnum.BACKEND_INVALID_CODEX_AUTH_JSON
      });
    }

    let expiresTs =
      typeof openaiAuth.expires === 'number' ? openaiAuth.expires : undefined;

    let refreshTs = this.editorCodexService.parseJwtExp({
      token: refreshToken
    });

    user.codexAuthJson = authJson;
    user.codexAuthUpdateTs = Date.now();
    user.codexAuthExpiresTs = expiresTs;
    user.codexAuthRefreshTs = refreshTs;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetUserCodexAuthResponsePayload = {
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
