import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class SetUserTimezoneController {
  constructor(
    private connection: Connection,
    private memberRepository: repositories.MembersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserTimezone)
  async setUserTimezone(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetUserTimezoneRequest)
    reqValid: apiToBackend.ToBackendSetUserTimezoneRequest
  ) {
    let { timezone } = reqValid.payload;

    user.timezone = timezone;

    let userMembers = <entities.MemberEntity[]>await this.memberRepository.find(
      {
        member_id: user.user_id
      }
    );

    userMembers.map(member => {
      member.timezone = timezone;
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

    let payload: apiToBackend.ToBackendSetUserTimezoneResponsePayload = {
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
