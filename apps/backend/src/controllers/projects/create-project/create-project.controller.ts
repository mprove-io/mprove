import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateProjectRequestDto,
  ToBackendCreateProjectResponseDto
} from '#backend/controllers/projects/create-project/create-project.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { notesTable } from '#backend/drizzle/postgres/schema/notes';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateProjectOutput } from '#common/types/backend/routes/projects/create-project/create-project-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateProjectController {
  constructor(
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private projectsService: ProjectsService,
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    private db: DbService
  ) {}

  @Post('api/ToBackendCreateProject' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateProject',
    description: 'Create a new project'
  })
  @ApiOkResponse({
    type: ToBackendCreateProjectResponseDto
  })
  async createProject(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateProjectRequestDto
  ): Promise<BackendResultForOperation<'createProject'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        name: body.input.name,
        remoteType: body.input.remoteType,
        gitUrl: body.input.gitUrl,
        noteId: body.input.noteId,
        traceId: body.traceId,
        user: user
      }),
      Result.bind('org', v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
      Result.andThrough(v =>
        this.orgsService.checkUserIsOrgOwner({
          org: v.org,
          userId: v.user.userId
        })
      ),
      Result.andThrough(v => {
        let demoOrgId: string =
          this.cs.get<BackendConfig['demoOrgId']>('demoOrgId');

        return v.org.orgId === demoOrgId
          ? Result.fail({ code: 'BACKEND_RESTRICTED_ORGANIZATION' })
          : Result.succeed();
      }),
      Result.bind('hashSecret', v =>
        this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind('nameHash', v =>
        this.hashService.makeHash({
          input: v.name,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('existingProject', v =>
        this.db.projects.findFirst({
          where: and(
            eq(projectsTable.orgId, v.orgId),
            eq(projectsTable.nameHash, v.nameHash)
          )
        })
      ),
      Result.andThrough(v =>
        isDefined(v.existingProject)
          ? Result.fail({ code: 'BACKEND_PROJECT_ALREADY_EXISTS' })
          : Result.succeed()
      ),
      Result.bind('note', async v =>
        v.remoteType !== 'GitClone'
          ? Result.succeed(undefined)
          : this.db.notes.findFirstCheckExists({
              where: eq(notesTable.noteId, v.noteId)
            })
      ),
      Result.bind('newProject', v =>
        this.projectsService.addProject({
          orgId: v.orgId,
          name: v.name,
          traceId: v.traceId,
          user: v.user,
          seedProjectId: undefined,
          remoteType: v.remoteType,
          projectId: makeId(),
          gitUrl: v.gitUrl,
          // Managed projects have no credential note.
          publicKey: v.note?.publicKey,
          privateKey: v.note?.privateKey,
          publicKeyEncrypted: v.note?.publicKeyEncrypted,
          privateKeyEncrypted: v.note?.privateKeyEncrypted,
          passPhrase: v.note?.passPhrase,
          evs: [],
          connections: []
        })
      ),
      Result.andThrough(v =>
        this.db.drizzle
          .delete(notesTable)
          .where(eq(notesTable.noteId, v.noteId))
          .then(() => Result.succeed())
      ),
      Result.map(
        (v): ToBackendCreateProjectOutput => ({
          project: this.projectsService.tabToApiProject({
            project: v.newProject,
            isAddPublicKey: true,
            isAddGitUrl: true
          })
        })
      )
    );
  }
}
