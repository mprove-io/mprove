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
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateProjectRequestDto,
  ToBackendCreateProjectResponseDto
} from '#backend/controllers/projects/create-project/create-project.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { NoteTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { notesTable } from '#backend/drizzle/postgres/schema/notes';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeId } from '#common/functions/make-id';
import { ServerError } from '#common/models/server-error';
import type { ToBackendCreateProjectResponsePayload } from '#common/zod/to-backend/projects/to-backend-create-project';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateProject)
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
  ) {
    let { traceId } = body.info;
    let { name, orgId, remoteType, noteId, gitUrl } = body.payload;

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

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let nameHash = this.hashService.makeHash({
      input: name,
      hashSecret: hashSecret
    });

    let project = await this.db.drizzle.query.projectsTable
      .findFirst({
        where: and(
          eq(projectsTable.orgId, orgId),
          eq(projectsTable.nameHash, nameHash)
        )
      })
      .then(x => this.tabService.projectEntToTab(x));

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
        .then(x => this.tabService.noteEntToTab(x));

      if (isUndefined(note)) {
        throw new ServerError({
          message: ErEnum.BACKEND_NOTE_DOES_NOT_EXIST
        });
      }
    }

    let newProject = await this.projectsService.addProject({
      orgId: orgId,
      name: name,
      traceId: body.info.traceId,
      user: user,
      testProjectId: undefined,
      remoteType: remoteType,
      projectId: makeId(),
      gitUrl: gitUrl,
      publicKey: note?.publicKey, // note is undefined for ProjectRemoteTypeEnum.Managed
      privateKey: note?.privateKey,
      publicKeyEncrypted: note?.publicKeyEncrypted,
      privateKeyEncrypted: note?.privateKeyEncrypted,
      passPhrase: note?.passPhrase,
      evs: [],
      connections: []
    });

    await this.db.drizzle
      .delete(notesTable)
      .where(eq(notesTable.noteId, noteId));

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
