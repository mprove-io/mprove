import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendIsProjectExistRequestDto,
  ToBackendIsProjectExistResponseDto
} from '#backend/controllers/projects/is-project-exist/is-project-exist.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import type { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import type { MakeHashResultError } from '#common/types/backend/function-errors/make-hash-result-error';
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
    private orgsService: OrgsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendIsProjectExist' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'IsProjectExist',
    description: 'Check if a project with the given name exists'
  })
  @ApiOkResponse({
    type: ToBackendIsProjectExistResponseDto
  })
  isProjectExist(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendIsProjectExistRequestDto
  ): Promise<BackendResultForOperation<'isProjectExist'>> {
    return Result.pipe(
      Result.succeed({
        name: body.input.name,
        orgId: body.input.orgId,
        orgsService: this.orgsService,
        dconfigsService: this.dconfigsService,
        hashService: this.hashService,
        db: this.db
      }),
      Result.andThrough(v =>
        v.orgsService.getOrgCheckExistsResult({ orgId: v.orgId })
      ),
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
      Result.bind(
        'projectEnt',
        async (v): Result.ResultAsync<ProjectEnt, never> => {
          let projectEnt: ProjectEnt =
            await v.db.drizzle.query.projectsTable.findFirst({
              where: eq(projectsTable.nameHash, v.nameHash)
            });

          return Result.succeed(projectEnt);
        }
      ),
      Result.map(
        (v): ToBackendIsProjectExistOutput => ({
          isExist: isDefined(v.projectEnt)
        })
      )
    );
  }
}
