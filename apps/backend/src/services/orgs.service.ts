import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';

import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeId } from '~common/_index';
import { RabbitService } from './rabbit.service';

let retry = require('async-retry');

@Injectable()
export class OrgsService {
  constructor(
    private rabbitService: RabbitService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getOrgCheckExists(item: { orgId: string }) {
    let { orgId } = item;

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.orgId, orgId)
    });

    if (isUndefined(org)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ORG_DOES_NOT_EXIST
      });
    }

    return org;
  }

  async checkUserIsOrgOwner(item: {
    userId: string;
    org: OrgEnt;
  }) {
    let { org, userId } = item;

    if (org.ownerId !== userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_ONLY_ORG_OWNER_CAN_ACCESS
      });
    }

    return;
  }

  async addOrg(item: {
    ownerId: string;
    ownerEmail: string;
    name: string;
    traceId: string;
    orgId?: string;
  }) {
    let { ownerId, ownerEmail, name, traceId, orgId } = item;

    let newOrg: OrgEnt = {
      orgId: orgId || makeId(),
      name: name,
      ownerId: ownerId,
      ownerEmail: ownerEmail,
      serverTs: undefined
    };

    let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: newOrg.orgId
      }
    };

    await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateOrgResponse>({
      routingKey: makeRoutingKeyToDisk({
        orgId: newOrg.orgId,
        projectId: undefined
      }),
      message: createOrgRequest,
      checkIsOk: true
    });

    await retry(
      async () => {
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                orgs: [newOrg]
              }
            })
        );
      },
      getRetryOption(this.cs, this.logger)
    );

    return newOrg;
  }
}
