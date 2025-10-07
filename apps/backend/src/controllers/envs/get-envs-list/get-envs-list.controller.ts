import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetEnvsListRequest,
  ToBackendGetEnvsListResponsePayload
} from '~common/interfaces/to-backend/envs/to-backend-get-envs-list';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetEnvsListController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapEnxToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetEnvsList)
  async getEnvsList(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetEnvsListRequest = request.body;

    let { projectId, isFilter } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let envs = await this.db.drizzle.query.envsTable.findMany({
      where: eq(envsTable.projectId, projectId)
    });

    if (isFilter === true) {
      envs = envs.filter(
        x =>
          x.memberIds.indexOf(user.userId) > -1 || x.envId === PROJECT_ENV_PROD
      );
    }

    let sortedEnvs = envs.sort((a, b) =>
      a.envId > b.envId ? 1 : b.envId > a.envId ? -1 : 0
    );

    let payload: ToBackendGetEnvsListResponsePayload = {
      envsList: sortedEnvs.map(x => this.wrapToApiService.wrapToApiEnvsItem(x))
    };

    return payload;
  }
}
