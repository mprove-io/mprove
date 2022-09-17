import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { NoteEntity } from '~backend/models/store-entities/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateProjectController {
  constructor(
    private dbService: DbService,
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private orgsService: OrgsService,
    private projectsRepository: repositories.ProjectsRepository,
    private notesRepository: repositories.NotesRepository,
    private blockmlService: BlockmlService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject)
  async createProject(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateProjectRequest)
    reqValid: apiToBackend.ToBackendCreateProjectRequest
  ) {
    let { traceId } = reqValid.info;
    let {
      name,
      orgId,
      remoteType,
      defaultBranch,
      noteId,
      gitUrl
    } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    let project = await this.projectsRepository.findOne({
      org_id: orgId,
      name: name
    });

    if (common.isDefined(project)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_PROJECT_ALREADY_EXISTS
      });
    }

    let note: NoteEntity;

    if (remoteType === common.ProjectRemoteTypeEnum.GitClone) {
      note = await this.notesRepository.findOne({
        note_id: noteId
      });

      if (common.isUndefined(note)) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_NOTE_DOES_NOT_EXIST
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
      defaultBranch:
        remoteType === common.ProjectRemoteTypeEnum.Managed
          ? common.BRANCH_MASTER
          : defaultBranch || common.BRANCH_MASTER,
      gitUrl: gitUrl,
      privateKey: note?.private_key,
      publicKey: note?.public_key
    });

    let payload: apiToBackend.ToBackendCreateProjectResponsePayload = {
      project: wrapper.wrapToApiProject(newProject)
    };

    return payload;
  }
}
