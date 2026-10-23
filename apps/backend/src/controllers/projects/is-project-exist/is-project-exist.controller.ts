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
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendIsProjectExistOutput } from '#common/types/backend/routes/projects/is-project-exist/is-project-exist-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class IsProjectExistController {
  constructor(
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
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('nameHash', v =>
        this.hashService.makeHash({
          input: v.name,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('isProjectExist', v =>
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
