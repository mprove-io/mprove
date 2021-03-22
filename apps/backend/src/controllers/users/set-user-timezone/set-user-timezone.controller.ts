import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
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

    let records: interfaces.Records;

    await this.connection.transaction(async manager => {
      records = await db.modifyRecords({
        manager: manager,
        records: {
          users: [user],
          members: userMembers
        }
      });
    });

    let payload: apiToBackend.ToBackendSetUserTimezoneResponsePayload = {
      user: wrapper.wrapToApiUser(records.users[0])
    };

    return payload;
  }
}
