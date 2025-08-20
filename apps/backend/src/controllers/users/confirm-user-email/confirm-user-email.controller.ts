import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';

import { SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class ConfirmUserEmailController {
  constructor(
    private jwtService: JwtService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendConfirmUserEmail)
  async confirmUserEmail(@Req() request: any) {
    let reqValid: ToBackendConfirmUserEmailRequest = request.body;

    let { traceId } = reqValid.info;
    let { token } = reqValid.payload;

    let user = await this.db.drizzle.query.usersTable.findFirst({
      where: eq(usersTable.emailVerificationToken, token)
    });

    if (isUndefined(user)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (isUndefined(user.hash)) {
      throw new ServerError({
        message: ErEnum.BACKEND_REGISTER_TO_SET_PASSWORD
      });
    }

    await this.membersService.addMemberToFirstProject({
      traceId: traceId,
      user: user
    });

    let payload: ToBackendConfirmUserEmailResponsePayload = {};

    if (user.isEmailVerified === false) {
      user.isEmailVerified = true;

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

      payload = {
        token: this.jwtService.sign({ userId: user.userId }),
        user: this.wrapToApiService.wrapToApiUser(user)
      };
    }

    return payload;
  }
}
