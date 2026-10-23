import type { DbTableRegistry } from '#backend/services/db/create-db-table-registry';

export class DbTableAccess implements DbTableRegistry {
  protected readonly tableRegistry: DbTableRegistry;

  constructor(item: { tableRegistry: DbTableRegistry }) {
    let { tableRegistry } = item;

    this.tableRegistry = tableRegistry;
  }

  get avatars(): DbTableRegistry['avatars'] {
    return this.tableRegistry.avatars;
  }

  get branches(): DbTableRegistry['branches'] {
    return this.tableRegistry.branches;
  }

  get bridges(): DbTableRegistry['bridges'] {
    return this.tableRegistry.bridges;
  }

  get cachedColumns(): DbTableRegistry['cachedColumns'] {
    return this.tableRegistry.cachedColumns;
  }

  get cachedParts(): DbTableRegistry['cachedParts'] {
    return this.tableRegistry.cachedParts;
  }

  get charts(): DbTableRegistry['charts'] {
    return this.tableRegistry.charts;
  }

  get connections(): DbTableRegistry['connections'] {
    return this.tableRegistry.connections;
  }

  get dashboards(): DbTableRegistry['dashboards'] {
    return this.tableRegistry.dashboards;
  }

  get dconfigs(): DbTableRegistry['dconfigs'] {
    return this.tableRegistry.dconfigs;
  }

  get envs(): DbTableRegistry['envs'] {
    return this.tableRegistry.envs;
  }

  get givens(): DbTableRegistry['givens'] {
    return this.tableRegistry.givens;
  }

  get favorites(): DbTableRegistry['favorites'] {
    return this.tableRegistry.favorites;
  }

  get kits(): DbTableRegistry['kits'] {
    return this.tableRegistry.kits;
  }

  get mconfigs(): DbTableRegistry['mconfigs'] {
    return this.tableRegistry.mconfigs;
  }

  get members(): DbTableRegistry['members'] {
    return this.tableRegistry.members;
  }

  get modelFieldLeafs(): DbTableRegistry['modelFieldLeafs'] {
    return this.tableRegistry.modelFieldLeafs;
  }

  get models(): DbTableRegistry['models'] {
    return this.tableRegistry.models;
  }

  get notes(): DbTableRegistry['notes'] {
    return this.tableRegistry.notes;
  }

  get ocEvents(): DbTableRegistry['ocEvents'] {
    return this.tableRegistry.ocEvents;
  }

  get ocMessages(): DbTableRegistry['ocMessages'] {
    return this.tableRegistry.ocMessages;
  }

  get ocParts(): DbTableRegistry['ocParts'] {
    return this.tableRegistry.ocParts;
  }

  get ocSessions(): DbTableRegistry['ocSessions'] {
    return this.tableRegistry.ocSessions;
  }

  get orgs(): DbTableRegistry['orgs'] {
    return this.tableRegistry.orgs;
  }

  get projects(): DbTableRegistry['projects'] {
    return this.tableRegistry.projects;
  }

  get providers(): DbTableRegistry['providers'] {
    return this.tableRegistry.providers;
  }

  get queries(): DbTableRegistry['queries'] {
    return this.tableRegistry.queries;
  }

  get reports(): DbTableRegistry['reports'] {
    return this.tableRegistry.reports;
  }

  get roles(): DbTableRegistry['roles'] {
    return this.tableRegistry.roles;
  }

  get sessions(): DbTableRegistry['sessions'] {
    return this.tableRegistry.sessions;
  }

  get structs(): DbTableRegistry['structs'] {
    return this.tableRegistry.structs;
  }

  get uconfigs(): DbTableRegistry['uconfigs'] {
    return this.tableRegistry.uconfigs;
  }

  get users(): DbTableRegistry['users'] {
    return this.tableRegistry.users;
  }
}
