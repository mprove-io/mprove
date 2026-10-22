import type { DbTableMap } from '#backend/services/db/db-table-types';

export class DbTableAccess implements DbTableMap {
  private readonly tableMap: DbTableMap;

  constructor(item: { tableMap: DbTableMap }) {
    let { tableMap } = item;

    this.tableMap = tableMap;
  }

  get avatars(): DbTableMap['avatars'] {
    return this.tableMap.avatars;
  }

  get branches(): DbTableMap['branches'] {
    return this.tableMap.branches;
  }

  get bridges(): DbTableMap['bridges'] {
    return this.tableMap.bridges;
  }

  get cachedColumns(): DbTableMap['cachedColumns'] {
    return this.tableMap.cachedColumns;
  }

  get cachedParts(): DbTableMap['cachedParts'] {
    return this.tableMap.cachedParts;
  }

  get charts(): DbTableMap['charts'] {
    return this.tableMap.charts;
  }

  get connections(): DbTableMap['connections'] {
    return this.tableMap.connections;
  }

  get dashboards(): DbTableMap['dashboards'] {
    return this.tableMap.dashboards;
  }

  get dconfigs(): DbTableMap['dconfigs'] {
    return this.tableMap.dconfigs;
  }

  get envs(): DbTableMap['envs'] {
    return this.tableMap.envs;
  }

  get givens(): DbTableMap['givens'] {
    return this.tableMap.givens;
  }

  get kits(): DbTableMap['kits'] {
    return this.tableMap.kits;
  }

  get mconfigs(): DbTableMap['mconfigs'] {
    return this.tableMap.mconfigs;
  }

  get members(): DbTableMap['members'] {
    return this.tableMap.members;
  }

  get modelFieldLeafs(): DbTableMap['modelFieldLeafs'] {
    return this.tableMap.modelFieldLeafs;
  }

  get models(): DbTableMap['models'] {
    return this.tableMap.models;
  }

  get notes(): DbTableMap['notes'] {
    return this.tableMap.notes;
  }

  get ocEvents(): DbTableMap['ocEvents'] {
    return this.tableMap.ocEvents;
  }

  get ocMessages(): DbTableMap['ocMessages'] {
    return this.tableMap.ocMessages;
  }

  get ocParts(): DbTableMap['ocParts'] {
    return this.tableMap.ocParts;
  }

  get ocSessions(): DbTableMap['ocSessions'] {
    return this.tableMap.ocSessions;
  }

  get orgs(): DbTableMap['orgs'] {
    return this.tableMap.orgs;
  }

  get projects(): DbTableMap['projects'] {
    return this.tableMap.projects;
  }

  get providers(): DbTableMap['providers'] {
    return this.tableMap.providers;
  }

  get queries(): DbTableMap['queries'] {
    return this.tableMap.queries;
  }

  get reports(): DbTableMap['reports'] {
    return this.tableMap.reports;
  }

  get roles(): DbTableMap['roles'] {
    return this.tableMap.roles;
  }

  get sessions(): DbTableMap['sessions'] {
    return this.tableMap.sessions;
  }

  get structs(): DbTableMap['structs'] {
    return this.tableMap.structs;
  }

  get uconfigs(): DbTableMap['uconfigs'] {
    return this.tableMap.uconfigs;
  }

  get users(): DbTableMap['users'] {
    return this.tableMap.users;
  }
}
