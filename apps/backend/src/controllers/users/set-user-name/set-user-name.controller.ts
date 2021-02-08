import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { decorators } from '~backend/barrels/decorators';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';

@Controller()
export class SetUserNameController {
  constructor(
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>,
    private memberRepository: repositories.MembersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserName)
  async setUserName(
    @Body() body,
    @decorators.AttachUser() user: entities.UserEntity
  ) {
    try {
      let reqValid = await common.transformValid({
        classType: apiToBackend.ToBackendSetUserNameRequest,
        object: body,
        errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let { firstName, lastName } = reqValid.payload;

      user.first_name = firstName;
      user.last_name = lastName;

      let userMembers = <entities.MemberEntity[]>(
        await this.memberRepository.find({
          member_id: user.user_id
        })
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

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
