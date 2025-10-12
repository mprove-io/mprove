import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { NoteTab, UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { notesTable } from '~backend/drizzle/postgres/schema/notes';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { NotesService } from '~backend/services/db/notes.service';
import { OrgsService } from '~backend/services/db/orgs.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { HashService } from '~backend/services/hash.service';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendCreateProjectRequest,
  ToBackendCreateProjectResponsePayload
} from '~common/interfaces/to-backend/projects/to-backend-create-project';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateProjectController {
  constructor(
    private hashService: HashService,
    private projectsService: ProjectsService,
    private notesService: NotesService,
    private orgsService: OrgsService,
    private logger: Logger,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateProject)
  async createProject(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateProjectRequest = request.body;

    let { traceId } = reqValid.info;
    let { name, orgId, remoteType, noteId, gitUrl } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let demoOrgId = this.cs.get<BackendConfig['demoOrgId']>('demoOrgId');

    if (org.orgId === demoOrgId) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_ORGANIZATION
      });
    }

    let nameHash = this.hashService.makeHash(name);

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: and(
        eq(projectsTable.orgId, orgId),
        eq(projectsTable.nameHash, nameHash)
      )
    });

    if (isDefined(project)) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROJECT_ALREADY_EXISTS
      });
    }

    let note: NoteTab;

    if (remoteType === ProjectRemoteTypeEnum.GitClone) {
      note = await this.db.drizzle.query.notesTable
        .findFirst({
          where: eq(notesTable.noteId, noteId)
        })
        .then(x => this.notesService.entToTab(x));

      if (isUndefined(note)) {
        throw new ServerError({
          message: ErEnum.BACKEND_NOTE_DOES_NOT_EXIST
        });
      }
    }

    let newProject = await this.projectsService.addProject({
      orgId: orgId,
      name: name,
      traceId: reqValid.info.traceId,
      user: user,
      testProjectId: undefined,
      remoteType: remoteType,
      projectId: makeId(),
      gitUrl: gitUrl,
      privateKey: note.privateKey,
      publicKey: note.publicKey,
      evs: [],
      connections: []
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx.delete(notesTable).where(eq(notesTable.noteId, noteId));
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendCreateProjectResponsePayload = {
      project: this.projectsService.tabToApiProject({
        project: newProject,
        isAddPublicKey: true,
        isAddGitUrl: true
      })
    };

    return payload;
  }
}
