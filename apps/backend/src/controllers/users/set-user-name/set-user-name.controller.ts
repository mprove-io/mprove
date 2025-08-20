import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetUserNameController {
  constructor(
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetUserName)
  async setUserName(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendSetUserNameRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { firstName, lastName } = reqValid.payload;

    user.firstName = firstName;
    user.lastName = lastName;

    let userMembers = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    userMembers.map(member => {
      member.firstName = firstName;
      member.lastName = lastName;
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user],
                members: userMembers
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetUserNameResponsePayload = {
      user: this.wrapToApiService.wrapToApiUser(user)
    };

    return payload;
  }
}
