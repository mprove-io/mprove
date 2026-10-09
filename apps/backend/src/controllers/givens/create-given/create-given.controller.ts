import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateGivenRequestDto,
  ToBackendCreateGivenResponseDto
} from '#backend/controllers/givens/create-given/create-given.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  GivenTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiGivensResultError } from '#common/types/backend/function-errors/get-api-givens-result-error';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { Given } from '#common/types/backend/parts/given/given';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateGivenOutput } from '#common/types/backend/routes/givens/create-given/create-given-output';

type CreateGivenWriteState = {
  projectId: string;
  userMember: MemberTab;
  given: GivenTab;
};

@ApiTags('Givens')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCreateGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateGiven',
    description: 'Create a project given'
  })
  @ApiOkResponse({
    type: ToBackendCreateGivenResponseDto
  })
  async createGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateGivenRequestDto
  ): Promise<BackendResultForOperation<'createGiven'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        givenId: body.input.givenId,
        type: body.input.type,
        isMultiple: body.input.isMultiple,
        values: body.input.values,
        user: user
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          this.membersService.getMemberCheckIsAdminResult({
            memberId: v.user.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.givensService.checkGivenDoesNotExistResult({
          projectId: v.projectId,
          givenId: v.givenId
        })
      ),
      Result.andThrough(v =>
        this.givensService.validateGivenValuesResult({
          type: v.type,
          isMultiple: v.isMultiple,
          values: v.values
        })
      ),
      Result.map(
        (v): CreateGivenWriteState => ({
          projectId: v.projectId,
          userMember: v.userMember,
          given: this.givensService.makeGiven({
            projectId: v.projectId,
            givenId: v.givenId,
            type: v.type,
            isMultiple: v.isMultiple,
            values: v.values
          })
        })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insert: { givens: [v.given] }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiGivens',
        (v): Result.ResultAsync<Given[], GetApiGivensResultError> =>
          this.givensService.getApiGivensResult({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendCreateGivenOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          givens: v.apiGivens
        })
      )
    );
  }
}
