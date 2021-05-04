import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { EmailService } from '~backend/services/email.service';
import { UsersService } from '~backend/services/users.service';

@SkipJwtCheck()
@Controller()
export class RegisterUserController {
  constructor(
    private usersService: UsersService,
    private dbService: DbService,
    private emailService: EmailService,
    private cs: ConfigService<interfaces.Config>,
    private userRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendRegisterUser)
  async registerUser(
    @ValidateRequest(apiToBackend.ToBackendRegisterUserRequest)
    reqValid: apiToBackend.ToBackendRegisterUserRequest
  ) {
    let { email, password } = reqValid.payload;

    let newUser: entities.UserEntity;

    let { salt, hash } = await this.usersService.makeSaltAndHash(password);

    let user = await this.userRepository.findOne({ email: email });

    if (common.isDefined(user)) {
      if (common.isDefined(user.hash)) {
        throw new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_USER_ALREADY_REGISTERED
        });
      } else {
        user.hash = hash;
        user.salt = salt;

        newUser = user;
      }
    }

    if (common.isUndefined(user)) {
      let onlyInv = this.cs.get<interfaces.Config['registerOnlyInvitedUsers']>(
        'registerOnlyInvitedUsers'
      );

      if (onlyInv === common.BoolEnum.TRUE) {
        throw new common.ServerError({
          message: apiToBackend.ErEnum.BACKEND_USER_IS_NOT_INVITED
        });
      } else {
        let alias = await this.usersService.makeAlias(email);

        newUser = maker.makeUser({
          email: email,
          isEmailVerified: common.BoolEnum.FALSE,
          hash: hash,
          salt: salt,
          alias: alias
        });
      }
    }

    await this.dbService.writeRecords({
      modify: common.isDefined(user),
      records: {
        users: [newUser]
      }
    });

    await this.emailService.sendEmailVerification({
      email: email,
      emailVerificationToken: newUser.email_verification_token
    });

    let payload: apiToBackend.ToBackendRegisterUserResponsePayload = {
      user: wrapper.wrapToApiUser(newUser)
    };

    return payload;
  }
}
