import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetUserCodexAuthRequestDto,
  ToBackendSetUserCodexAuthResponseDto
} from '#backend/controllers/users/set-user-codex-auth/set-user-codex-auth.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ServerError } from '#common/models/server-error';
import type { ToBackendSetUserCodexAuthResponsePayload } from '#common/zod/to-backend/users/to-backend-set-user-codex-auth';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
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
  @ApiOperation({
    summary: 'SetUserCodexAuth',
    description: "Store the user's Codex auth credentials"
  })
  @ApiOkResponse({
    type: ToBackendSetUserCodexAuthResponseDto
  })
  async setUserCodexAuth(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetUserCodexAuthRequestDto
  ) {
    this.usersService.checkUserIsNotRestricted({ user: user });

    let { authJson } = body.payload;

    let parsed = this.editorCodexService.parseCodexAuthJson({
      authJsonContent: authJson
    });

    if (!parsed) {
      throw new ServerError({
        message: ErEnum.BACKEND_INVALID_CODEX_AUTH_JSON
      });
    }

    user.codexAuth = parsed;
    user.codexAuthUpdateTs = Date.now();
    user.codexAuthExpiresTs = parsed.openai.expires;

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
