import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { JwtAuthGuard } from '~backend/auth-guards/jwt-auth.guard';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { decorators } from '~backend/barrels/decorators';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';

@UseGuards(JwtAuthGuard)
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
    @decorators.AttachUser() user: entities.UserEntity
  ) {
    try {
      let reqValid = await common.transformValid({
        classType: apiToBackend.ToBackendSetUserTimezoneRequest,
        object: body,
        errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

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
