import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { OrgTab } from '~backend/drizzle/postgres/schema/_tabs';
import { OrgEnt, orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ErEnum } from '~common/enums/er.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import { makeId } from '~common/functions/make-id';
import { Org } from '~common/interfaces/backend/org';
import { OrgsItem } from '~common/interfaces/backend/orgs-item';
import { OrgLt, OrgSt } from '~common/interfaces/st-lt';
import {
  ToDiskCreateOrgRequest,
  ToDiskCreateOrgResponse
} from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { RabbitService } from '../rabbit.service';
import { TabService } from '../tab.service';

let retry = require('async-retry');

@Injectable()
export class OrgsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private rabbitService: RabbitService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(orgEnt: OrgEnt): OrgTab {
    if (isUndefined(orgEnt)) {
      return;
    }

    let org: OrgTab = {
      ...orgEnt,
      ...this.tabService.decrypt<OrgSt>({
        encryptedString: orgEnt.st
      }),
      ...this.tabService.decrypt<OrgLt>({
        encryptedString: orgEnt.lt
      })
    };

    return org;
  }

  tabToApi(item: { org: OrgTab }): Org {
    let { org } = item;

    let apiOrg: Org = {
      orgId: org.orgId,
      ownerId: org.ownerId,
      name: org.name,
      ownerEmail: org.ownerEmail,
      serverTs: Number(org.serverTs)
    };

    return apiOrg;
  }

  tabToApiOrgsItem(item: { org: OrgTab }): OrgsItem {
    let { org } = item;

    let apiOrgsItem: OrgsItem = {
      orgId: org.orgId,
      name: org.name
    };

    return apiOrgsItem;
  }

  async getOrgCheckExists(item: { orgId: string }) {
    let { orgId } = item;

    let org = await this.db.drizzle.query.orgsTable
      .findFirst({
        where: eq(orgsTable.orgId, orgId)
      })
      .then(x => this.entToTab(x));

    if (isUndefined(org)) {
      throw new ServerError({
        message: ErEnum.BACKEND_ORG_DOES_NOT_EXIST
      });
    }

    return org;
  }

  async checkUserIsOrgOwner(item: {
    userId: string;
    org: OrgTab;
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

    let newOrg: OrgTab = {
      orgId: orgId || makeId(),
      name: name,
      ownerId: ownerId,
      ownerEmail: ownerEmail,
      nameHash: undefined, // tab-to-ent
      ownerEmailHash: undefined, // tab-to-ent
      serverTs: undefined
    };

    let createOrgRequest: ToDiskCreateOrgRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
        traceId: traceId
      },
      payload: {
        orgId: newOrg.orgId
      }
    };

    await this.rabbitService.sendToDisk<ToDiskCreateOrgResponse>({
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
