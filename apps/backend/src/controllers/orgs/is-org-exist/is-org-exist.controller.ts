import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendIsOrgExistRequestDto,
  ToBackendIsOrgExistResponseDto
} from '#backend/controllers/orgs/is-org-exist/is-org-exist.dto';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendIsOrgExistOutput } from '#common/types/backend/routes/orgs/is-org-exist/is-org-exist-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsOrgExistController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private db: DbService
  ) {}

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
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind(
        'nameHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHash({
            input: v.name,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'isOrgExist',
        (v): Result.ResultAsync<boolean, never> =>
          this.db.orgs.isExist({
            where: eq(orgsTable.nameHash, v.nameHash)
          })
      ),
      Result.map((v): ToBackendIsOrgExistOutput => ({ isExist: v.isOrgExist }))
    );
  }
}
