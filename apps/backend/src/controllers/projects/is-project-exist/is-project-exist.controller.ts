import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/db/orgs.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { HashService } from '~backend/services/hash.service';
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
    private hashService: HashService,
    private projectsService: ProjectsService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  async isProjectExist(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendIsProjectExistRequest = request.body;

    let { name, orgId } = reqValid.payload;

    await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let nameHash = this.hashService.makeHash(name);

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.nameHash, nameHash)
    });

    let payload: ToBackendIsProjectExistResponsePayload = {
      isExist: isDefined(project)
    };

    return payload;
  }
}
