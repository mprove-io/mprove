import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendIsProjectExistRequest,
  ToBackendIsProjectExistResponsePayload
} from '~common/interfaces/to-backend/projects/to-backend-is-project-exist';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class IsProjectExistController {
  constructor(
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  async isProjectExist(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendIsProjectExistRequest = request.body;

    let { name, orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.name, name)
    });

    let payload: ToBackendIsProjectExistResponsePayload = {
      isExist: isDefined(project)
    };

    return payload;
  }
}
