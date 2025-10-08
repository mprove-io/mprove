import { Injectable } from '@nestjs/common';
import { OrgEnt } from '~backend/drizzle/postgres/schema/orgs';
import { OrgLt, OrgSt, OrgTab } from '~backend/drizzle/postgres/tabs/org-tab';
import { Org } from '~common/interfaces/backend/org';
import { OrgsItem } from '~common/interfaces/backend/orgs-item';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapOrgService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiOrgsItem(item: { org: OrgTab }): OrgsItem {
    let { org } = item;

    let apiOrgsItem: OrgsItem = {
      orgId: org.orgId,
      name: org.st.name
    };

    return apiOrgsItem;
  }

  tabToApi(item: { org: OrgTab }): Org {
    let { org } = item;

    let apiOrg: Org = {
      orgId: org.orgId,
      ownerId: org.ownerId,
      name: org.st.name,
      ownerEmail: org.st.ownerEmail,
      serverTs: Number(org.serverTs)
    };

    return apiOrg;
  }

  apiToTab(org: Org): OrgTab {
    let orgSt: OrgSt = {
      name: org.name,
      ownerEmail: org.ownerEmail
    };

    let orgLt: OrgLt = {};

    let orgTab: OrgTab = {
      orgId: org.orgId,
      ownerId: org.ownerId,
      st: orgSt,
      lt: orgLt,
      nameHash: this.hashService.makeHash(org.name),
      ownerEmailHash: this.hashService.makeHash(org.ownerEmail),
      serverTs: org.serverTs
    };

    return orgTab;
  }

  entToTab(org: OrgEnt): OrgTab {
    let orgTab: OrgTab = {
      ...org,
      st: this.tabService.decrypt<OrgSt>({
        encryptedString: org.st
      }),
      lt: this.tabService.decrypt<OrgLt>({
        encryptedString: org.lt
      })
    };

    return orgTab;
  }

  tabToEnt(org: OrgTab): OrgEnt {
    let orgEnt: OrgEnt = {
      ...org,
      st: this.tabService.encrypt({ data: org.st }),
      lt: this.tabService.encrypt({ data: org.lt })
    };

    return orgEnt;
  }
}
