import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

let type = apiToBackend.ToBackendSetUserTimezoneRequest;

@Controller()
export class SetUserTimezoneController {
  constructor(
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>,
    private memberRepository: repositories.MembersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserTimezone)
  async setUserTimezone(
    @Body() body,
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetUserTimezoneRequest)
    reqValid: apiToBackend.ToBackendSetUserTimezoneRequest
  ) {
    try {
      let { timezone } = reqValid.payload;

      user.timezone = timezone;

      let userMembers = <entities.MemberEntity[]>(
        await this.memberRepository.find({
          member_id: user.user_id
        })
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

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
