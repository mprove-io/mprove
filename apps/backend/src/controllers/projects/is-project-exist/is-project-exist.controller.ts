import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { isDefined } from '~common/functions/is-defined';

@UseGuards(ValidateRequestGuard)
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
