import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
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

    let records = await this.dbService.writeRecords({
      modify: true,
      records: {
        users: [user],
        members: userMembers
      }
    });

    let payload: apiToBackend.ToBackendSetUserNameResponsePayload = {
      user: wrapper.wrapToApiUser(records.users[0])
    };

    return payload;
  }
}
