import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  type ToBackendIsOrgExistRequestDto,
  ToBackendIsOrgExistResponseDto
} from '#backend/controllers/orgs/is-org-exist/is-org-exist.dto';
import { orgsTable } from '#backend/drizzle/postgres/tables/orgs';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendIsOrgExistOutput } from '#common/types/backend/routes/orgs/is-org-exist/is-org-exist-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsOrgExistController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendIsOrgExist' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'IsOrgExist',
    description: 'Check if an organization with the given name exists'
  })
  @ApiOkResponse({
    type: ToBackendIsOrgExistResponseDto
  })
  async isOrgExist(
    @Body() body: ToBackendIsOrgExistRequestDto
  ): Promise<BackendResultForOperation<'isOrgExist'>> {
    return Result.pipe(
      Result.succeed({
        name: body.input.name
      }),
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('nameHash', v =>
        makeHash({
          input: v.name,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('isOrgExist', v =>
        this.db.orgs.isExist({
          where: eq(orgsTable.nameHash, v.nameHash)
        })
      ),
      Result.map((v): ToBackendIsOrgExistOutput => ({ isExist: v.isOrgExist }))
    );
  }
}
