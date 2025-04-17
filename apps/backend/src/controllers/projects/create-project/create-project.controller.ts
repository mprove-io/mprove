import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { notesTable } from '~backend/drizzle/postgres/schema/notes';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateProjectController {
  constructor(
    private projectsService: ProjectsService,
    private orgsService: OrgsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateProject)
  async createProject(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateProjectRequest = request.body;

    let { traceId } = reqValid.info;
    let { name, orgId, remoteType, noteId, gitUrl } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let firstOrgId = this.cs.get<interfaces.Config['firstOrgId']>('firstOrgId');

    if (org.orgId === firstOrgId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_ORGANIZATION
      });
    }

    let project = await this.db.drizzle.query.projectsTable.findFirst({
      where: and(eq(projectsTable.orgId, orgId), eq(projectsTable.name, name))
    });

    // let project = await this.projectsRepository.findOne({
    //   where: {
    //     org_id: orgId,
    //     name: name
    //   }
    // });

    if (common.isDefined(project)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_PROJECT_ALREADY_EXISTS
      });
    }

    let note: schemaPostgres.NoteEnt;

    if (remoteType === common.ProjectRemoteTypeEnum.GitClone) {
      note = await this.db.drizzle.query.notesTable.findFirst({
        where: eq(notesTable.noteId, noteId)
      });

      // note = await this.notesRepository.findOne({
      //   where: {
      //     note_id: noteId
      //   }
      // });

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
      projectId: common.makeId(),
      gitUrl: gitUrl,
      privateKey: note?.privateKey,
      publicKey: note?.publicKey,
      evs: []
    });

    let payload: apiToBackend.ToBackendCreateProjectResponsePayload = {
      project: this.wrapToApiService.wrapToApiProject({
        project: newProject,
        isAdmin: true
      })
    };

    return payload;
  }
}
