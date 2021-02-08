import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class SetUserNameController {
  constructor(
    private connection: Connection,
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

    let userMembers = <entities.MemberEntity[]>await this.memberRepository.find(
      {
        member_id: user.user_id
      }
    );

    userMembers.map(member => {
      member.first_name = firstName;
      member.last_name = lastName;
    });

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          users: [user],
          members: userMembers
        }
      });
    });

    let payload: apiToBackend.ToBackendSetUserNameResponsePayload = {
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
