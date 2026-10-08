import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendIsOrgExistRequestDto,
  ToBackendIsOrgExistResponseDto
} from '#backend/controllers/orgs/is-org-exist/is-org-exist.dto';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import { type OrgEnt, orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import type { MakeHashResultError } from '#common/types/backend/function-errors/make-hash-result-error';
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
    @Inject(DRIZZLE) private db: Db
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
        name: body.input.name,
        dconfigsService: this.dconfigsService,
        hashService: this.hashService,
        db: this.db
      }),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretResultError> =>
          v.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.bind(
        'nameHash',
        (v): Result.Result<string, MakeHashResultError> =>
          v.hashService.makeHashResult({
            input: v.name,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind('orgEnt', async (v): Result.ResultAsync<OrgEnt, never> => {
        let orgEnt: OrgEnt = await v.db.drizzle.query.orgsTable.findFirst({
          where: eq(orgsTable.nameHash, v.nameHash)
        });

        return Result.succeed(orgEnt);
      }),
      Result.map(
        (v): ToBackendIsOrgExistOutput => ({ isExist: isDefined(v.orgEnt) })
      )
    );
  }
}
