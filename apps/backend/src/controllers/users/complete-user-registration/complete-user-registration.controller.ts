import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { UsersService } from '~backend/services/users.service';

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class CompleteUserRegistrationController {
  constructor(
    private userRepository: repositories.UsersRepository,
    private dbService: DbService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private membersService: MembersService
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCompleteUserRegistration
  )
  async completeUserRegistration(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendCompleteUserRegistrationRequest =
      request.body;

    let { traceId } = reqValid.info;
    let { emailConfirmationToken, newPassword } = reqValid.payload;

    let user = await this.userRepository.findOne({
      where: {
        email_verification_token: emailConfirmationToken
      }
    });

    if (common.isUndefined(user)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_DOES_NOT_EXIST
      });
    }

    if (
      common.isDefined(user.hash) ||
      user.is_email_verified === common.BoolEnum.TRUE
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_USER_ALREADY_REGISTERED
      });
    }

    await this.membersService.addMemberToFirstProject({
      traceId: traceId,
      user: user
    });

    let payload: apiToBackend.ToBackendConfirmUserEmailResponsePayload = {};

    user.is_email_verified = common.BoolEnum.TRUE;

    let { salt, hash } = await this.usersService.makeSaltAndHash(newPassword);

    user.hash = hash;
    user.salt = salt;
    user.password_reset_expires_ts = (1).toString();

    await this.dbService.writeRecords({
      modify: true,
      records: {
        users: [user]
      }
    });

    payload = {
      token: this.jwtService.sign({ userId: user.user_id }),
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
