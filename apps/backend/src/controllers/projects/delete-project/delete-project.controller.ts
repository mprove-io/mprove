import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteProjectController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteProject)
  async deleteProject(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendDeleteProjectRequest = request.body;

    let { projectId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      projectId: projectId,
      memberId: user.userId
    });

    let toDiskDeleteProjectRequest: ToDiskDeleteProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteProject,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskDeleteProjectResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskDeleteProjectRequest,
        checkIsOk: true
      });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(projectsTable)
            .where(eq(projectsTable.projectId, projectId));

          await tx
            .delete(membersTable)
            .where(eq(membersTable.projectId, projectId));

          await tx
            .delete(connectionsTable)
            .where(eq(connectionsTable.projectId, projectId));

          await tx.delete(envsTable).where(eq(envsTable.projectId, projectId));

          await tx
            .delete(branchesTable)
            .where(eq(branchesTable.projectId, projectId));

          await tx
            .delete(bridgesTable)
            .where(eq(bridgesTable.projectId, projectId));
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
