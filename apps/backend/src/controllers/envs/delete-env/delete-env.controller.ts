import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteEnvController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteEnv)
  async deleteEnv(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteEnvRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    if (envId === common.PROJECT_ENV_PROD) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ENV_PROD_CAN_NOT_BE_DELETED
      });
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(envsTable)
            .where(
              and(
                eq(envsTable.projectId, projectId),
                eq(envsTable.envId, envId)
              )
            );

          await tx
            .delete(bridgesTable)
            .where(
              and(
                eq(bridgesTable.projectId, projectId),
                eq(bridgesTable.envId, envId)
              )
            );
        }),
      getRetryOption(this.cs, this.logger)
    );

    // await this.envsRepository.delete({
    //   project_id: projectId,
    //   env_id: envId
    // });

    // await this.bridgesRepository.delete({
    //   project_id: projectId,
    //   env_id: envId
    // });

    let payload = {};

    return payload;
  }
}
