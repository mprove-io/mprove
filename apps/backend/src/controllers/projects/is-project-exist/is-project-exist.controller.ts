import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendIsProjectExistRequestDto,
  ToBackendIsProjectExistResponseDto
} from '#backend/controllers/projects/is-project-exist/is-project-exist.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendIsProjectExistOutput } from '#common/types/backend/routes/projects/is-project-exist/is-project-exist-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsProjectExistController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private db: DbService
  ) {}

  @Post('api/ToBackendIsProjectExist' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'isProjectExist'>> {
    return Result.pipe(
      Result.succeed({
        name: body.input.name,
        orgId: body.input.orgId
      }),
      Result.andThrough(v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
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
        'isProjectExist',
        (v): Result.ResultAsync<boolean, never> =>
          this.db.projects.isExist({
            where: eq(projectsTable.nameHash, v.nameHash)
          })
      ),
      Result.map(
        (v): ToBackendIsProjectExistOutput => ({
          isExist: v.isProjectExist
        })
      )
    );
  }
}
