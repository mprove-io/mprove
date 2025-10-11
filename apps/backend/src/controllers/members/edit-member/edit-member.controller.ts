import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import {
  AvatarEnt,
  avatarsTable
} from '~backend/drizzle/postgres/schema/avatars';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { AvatarsService } from '~backend/services/db/avatars.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendEditMemberRequest,
  ToBackendEditMemberResponsePayload
} from '~common/interfaces/to-backend/members/to-backend-edit-member';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditMemberController {
  constructor(
    private projectsService: ProjectsService,
    private avatarsService: AvatarsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditMember)
  async editMember(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendEditMemberRequest = request.body;

    let { projectId, memberId, isAdmin, isEditor, isExplorer, roles } =
      reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    if (memberId === user.userId && isAdmin === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_ADMIN_CANNOT_CHANGE_HIS_ADMIN_STATUS
      });
    }

    let member = await this.membersService.getMemberCheckExists({
      memberId: memberId,
      projectId: projectId
    });

    member.isAdmin = isAdmin;
    member.isEditor = isEditor;
    member.isExplorer = isExplorer;
    member.roles = roles;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                members: [member]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let avatars = await this.db.drizzle
      .select({
        userId: avatarsTable.userId,
        st: avatarsTable.st
      })
      .from(avatarsTable)
      .where(eq(avatarsTable.userId, member.memberId))
      .then(xs => xs.map(x => this.avatarsService.entToTab(x as AvatarEnt)));

    let avatar = avatars.length > 0 ? avatars[0] : undefined;

    let apiMember = this.membersService.tabToApi({ member: member });

    if (isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatarSmall;
    }

    let payload: ToBackendEditMemberResponsePayload = {
      member: apiMember
    };

    return payload;
  }
}
