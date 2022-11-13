import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetUserTimezoneController {
  constructor(
    private dbService: DbService,
    private memberRepository: repositories.MembersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserTimezone)
  async setUserTimezone(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetUserTimezoneRequest = request.body;

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { timezone } = reqValid.payload;

    user.timezone = timezone;

    let userMembers = <entities.MemberEntity[]>await this.memberRepository.find(
      {
        where: {
          member_id: user.user_id
        }
      }
    );

    userMembers.map(member => {
      member.timezone = timezone;
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        users: [user],
        members: userMembers
      }
    });

    let payload: apiToBackend.ToBackendSetUserTimezoneResponsePayload = {
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
