import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';

@Controller()
export class SetUserNameController {
  constructor(
    private dbService: DbService,
    private memberRepository: repositories.MembersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserName)
  async setUserName(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetUserNameRequest)
    reqValid: apiToBackend.ToBackendSetUserNameRequest
  ) {
    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { firstName, lastName } = reqValid.payload;

    user.first_name = firstName;
    user.last_name = lastName;

    let userMembers = await this.memberRepository.find({
      member_id: user.user_id
    });

    userMembers.map(member => {
      member.first_name = firstName;
      member.last_name = lastName;
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        users: [user],
        members: userMembers
      }
    });

    let payload: apiToBackend.ToBackendSetUserNameResponsePayload = {
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
