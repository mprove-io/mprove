import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendIsProjectExistRequestDto,
  ToBackendIsProjectExistResponseDto
} from '#backend/controllers/projects/is-project-exist/is-project-exist.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ToBackendIsProjectExistResponsePayload } from '#common/zod/to-backend/projects/to-backend-is-project-exist';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
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
  @ApiOperation({
    summary: 'IsProjectExist',
    description: 'Check if a project with the given name exists'
  })
  @ApiOkResponse({
    type: ToBackendIsProjectExistResponseDto
  })
  async isProjectExist(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendIsProjectExistRequestDto
  ) {
    let { name, orgId } = body.payload;

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
