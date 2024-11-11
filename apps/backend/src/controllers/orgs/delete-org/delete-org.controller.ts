import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, inArray } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { evsTable } from '~backend/drizzle/postgres/schema/evs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { RabbitService } from '~backend/services/rabbit.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteOrgController {
  constructor(
    private orgsService: OrgsService,
    private rabbitService: RabbitService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteOrg)
  async deleteOrg(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteOrgRequest = request.body;

    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let toDiskDeleteOrgRequest: apiToDisk.ToDiskDeleteOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteOrg,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: org.orgId
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteOrgResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: orgId,
          projectId: undefined
        }),
        message: toDiskDeleteOrgRequest,
        checkIsOk: true
      });

    let projects = await this.db.drizzle.query.projectsTable.findMany({
      where: eq(projectsTable.orgId, orgId)
    });

    // let projects = await this.projectsRepository.find({
    //   where: { org_id: orgId }
    // });

    let projectIds = projects.map(x => x.projectId);

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx.delete(orgsTable).where(eq(orgsTable.orgId, orgId));

          if (projectIds.length > 0) {
            await tx
              .delete(projectsTable)
              .where(inArray(projectsTable.projectId, projectIds));

            await tx
              .delete(membersTable)
              .where(inArray(membersTable.projectId, projectIds));

            await tx
              .delete(connectionsTable)
              .where(inArray(connectionsTable.projectId, projectIds));

            await tx
              .delete(envsTable)
              .where(inArray(envsTable.projectId, projectIds));

            await tx
              .delete(evsTable)
              .where(inArray(evsTable.projectId, projectIds));

            await tx
              .delete(branchesTable)
              .where(inArray(branchesTable.projectId, projectIds));

            await tx
              .delete(bridgesTable)
              .where(inArray(bridgesTable.projectId, projectIds));
          }
        }),
      getRetryOption(this.cs, this.logger)
    );

    // await this.orgsRepository.delete({ org_id: orgId });

    // if (projectIds.length > 0) {
    //   await this.projectsRepository.delete({ project_id: In(projectIds) });
    //   await this.membersRepository.delete({ project_id: In(projectIds) });
    //   await this.connectionsRepository.delete({ project_id: In(projectIds) });
    //   await this.envsRepository.delete({ project_id: In(projectIds) });
    //   await this.evsRepository.delete({ project_id: In(projectIds) });
    //   await this.branchesRepository.delete({ project_id: In(projectIds) });
    //   await this.bridgesRepository.delete({ project_id: In(projectIds) });
    // }

    let payload = {};

    return payload;
  }
}
