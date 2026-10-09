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
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateProjectRequestDto,
  ToBackendCreateProjectResponseDto
} from '#backend/controllers/projects/create-project/create-project.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  NoteTab,
  OrgTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type NoteEnt,
  notesTable
} from '#backend/drizzle/postgres/schema/notes';
import {
  type ProjectEnt,
  projectsTable
} from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendNoteDoesNotExistError } from '#common/types/backend/errors/backend-note-does-not-exist-error';
import type { AddProjectResultError } from '#common/types/backend/function-errors/add-project-result-error';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import type { GetOrgCheckExistsResultError } from '#common/types/backend/function-errors/get-org-check-exists-result-error';
import type { MakeHashResultError } from '#common/types/backend/function-errors/make-hash-result-error';
import type { NoteEntToTabResultError } from '#common/types/backend/function-errors/note-ent-to-tab-result-error';
import type { ProjectEntToTabResultError } from '#common/types/backend/function-errors/project-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateProjectOutput } from '#common/types/backend/routes/projects/create-project/create-project-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateProjectController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private projectsService: ProjectsService,
    private orgsService: OrgsService,
    private logger: Logger,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, GetOrgCheckExistsResultError> =>
          this.orgsService.getOrgCheckExistsResult({ orgId: v.orgId })
      ),
      Result.andThrough(v =>
        this.orgsService.checkUserIsOrgOwnerResult({
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
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretResultError> =>
          this.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.bind(
        'nameHash',
        (v): Result.Result<string, MakeHashResultError> =>
          this.hashService.makeHashResult({
            input: v.name,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'existingProject',
        (v): Result.ResultAsync<ProjectTab, ProjectEntToTabResultError> =>
          this.db.drizzle.query.projectsTable
            .findFirst({
              where: and(
                eq(projectsTable.orgId, v.orgId),
                eq(projectsTable.nameHash, v.nameHash)
              )
            })
            .then((projectEnt: ProjectEnt) =>
              isUndefined(projectEnt)
                ? Result.succeed(undefined)
                : this.tabService.projectEntToTabResult({
                    projectEnt: projectEnt
                  })
            )
      ),
      Result.andThrough(v =>
        isDefined(v.existingProject)
          ? Result.fail({ code: 'BACKEND_PROJECT_ALREADY_EXISTS' })
          : Result.succeed()
      ),
      Result.bind(
        'note',
        async (
          v
        ): Result.ResultAsync<
          NoteTab,
          BackendNoteDoesNotExistError | NoteEntToTabResultError
        > => {
          if (v.remoteType !== 'GitClone') {
            return Result.succeed(undefined);
          }

          let noteEnt: NoteEnt =
            await this.db.drizzle.query.notesTable.findFirst({
              where: eq(notesTable.noteId, v.noteId)
            });

          return isUndefined(noteEnt)
            ? Result.fail({ code: 'BACKEND_NOTE_DOES_NOT_EXIST' })
            : this.tabService.noteEntToTabResult({
                noteEnt: noteEnt
              });
        }
      ),
      Result.bind(
        'newProject',
        (v): Result.ResultAsync<ProjectTab, AddProjectResultError> =>
          this.projectsService.addProjectResult({
            orgId: v.orgId,
            name: v.name,
            traceId: v.traceId,
            user: v.user,
            seedProjectId: undefined,
            remoteType: v.remoteType,
            projectId: makeId(),
            gitUrl: v.gitUrl,
            publicKey: v.note?.publicKey,
            privateKey: v.note?.privateKey,
            publicKeyEncrypted: v.note?.publicKeyEncrypted,
            privateKeyEncrypted: v.note?.privateKeyEncrypted,
            passPhrase: v.note?.passPhrase,
            evs: [],
            connections: []
          })
      ),
      Result.andThrough(
        (v): Result.ResultAsync<void, never> =>
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
