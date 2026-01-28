import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendIsProjectExistRequest,
  ToBackendIsProjectExistResponsePayload
} from '#common/interfaces/to-backend/projects/to-backend-is-project-exist';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DconfigsService } from '~backend/services/db/dconfigs.service';
import { OrgsService } from '~backend/services/db/orgs.service';
import { HashService } from '~backend/services/hash.service';
import { TabService } from '~backend/services/tab.service';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class IsProjectExistController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  async isProjectExist(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendIsProjectExistRequest = request.body;

    let { name, orgId } = reqValid.payload;

    await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let nameHash = this.hashService.makeHash({
      input: name,
      hashSecret: hashSecret
    });

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: eq(projectsTable.nameHash, nameHash)
    });

    let payload: ToBackendIsProjectExistResponsePayload = {
      isExist: isDefined(project)
    };

    return payload;
  }
}
