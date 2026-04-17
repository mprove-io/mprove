import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendIsOrgExistRequestDto,
  ToBackendIsOrgExistResponseDto
} from '#backend/controllers/orgs/is-org-exist/is-org-exist.dto';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ToBackendIsOrgExistResponsePayload } from '#common/zod/to-backend/orgs/to-backend-is-org-exist';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsOrgExistController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsOrgExist)
  @ApiOperation({
    summary: 'IsOrgExist',
    description: 'Check if an organization with the given name exists'
  })
  @ApiOkResponse({
    type: ToBackendIsOrgExistResponseDto
  })
  async isOrgExist(@Body() body: ToBackendIsOrgExistRequestDto) {
    let { name } = body.payload;

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let nameHash = this.hashService.makeHash({
      input: name,
      hashSecret: hashSecret
    });

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.nameHash, nameHash)
    });

    let payload: ToBackendIsOrgExistResponsePayload = {
      isExist: isDefined(org)
    };

    return payload;
  }
}
