import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetEnvsRequest,
  ToBackendGetEnvsResponsePayload
} from '#common/interfaces/to-backend/envs/to-backend-get-envs';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { TabService } from '~backend/services/tab.service';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetEnvsController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetEnvs)
  async getEnvs(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetEnvsRequest = request.body;

    let { projectId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let payload: ToBackendGetEnvsResponsePayload = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      envs: apiEnvs
    };

    return payload;
  }
}
