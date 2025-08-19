import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class IsProjectExistController {
  constructor(
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  async isProjectExist(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendIsProjectExistRequest = request.body;

    let { name, orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.name, name)
    });

    let payload: apiToBackend.ToBackendIsProjectExistResponsePayload = {
      isExist: isDefined(project)
    };

    return payload;
  }
}
