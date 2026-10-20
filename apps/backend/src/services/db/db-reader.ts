import type { DbExtra } from '#backend/drizzle/drizzle.module';
import {
  DbTableReader,
  type DbTableReaderKey
} from '#backend/services/db/db-table-reader';
import type { TabService } from '#backend/services/tab/tab.service';

type DbTableReaderMap = {
  [Key in DbTableReaderKey]: DbTableReader<Key>;
};

export class DbReader implements DbTableReaderMap {
  readonly avatars: DbTableReader<'avatars'>;
  readonly users: DbTableReader<'users'>;
  readonly branches: DbTableReader<'branches'>;
  readonly bridges: DbTableReader<'bridges'>;
  readonly cachedColumns: DbTableReader<'cachedColumns'>;
  readonly cachedParts: DbTableReader<'cachedParts'>;
  readonly charts: DbTableReader<'charts'>;
  readonly connections: DbTableReader<'connections'>;
  readonly dashboards: DbTableReader<'dashboards'>;
  readonly dconfigs: DbTableReader<'dconfigs'>;
  readonly envs: DbTableReader<'envs'>;
  readonly givens: DbTableReader<'givens'>;
  readonly kits: DbTableReader<'kits'>;
  readonly mconfigs: DbTableReader<'mconfigs'>;
  readonly members: DbTableReader<'members'>;
  readonly models: DbTableReader<'models'>;
  readonly notes: DbTableReader<'notes'>;
  readonly ocEvents: DbTableReader<'ocEvents'>;
  readonly ocMessages: DbTableReader<'ocMessages'>;
  readonly ocParts: DbTableReader<'ocParts'>;
  readonly ocSessions: DbTableReader<'ocSessions'>;
  readonly orgs: DbTableReader<'orgs'>;
  readonly projects: DbTableReader<'projects'>;
  readonly providers: DbTableReader<'providers'>;
  readonly queries: DbTableReader<'queries'>;
  readonly reports: DbTableReader<'reports'>;
  readonly roles: DbTableReader<'roles'>;
  readonly sessions: DbTableReader<'sessions'>;
  readonly structs: DbTableReader<'structs'>;
  readonly uconfigs: DbTableReader<'uconfigs'>;

  constructor(item: { dbExtra: DbExtra; tabService: TabService }) {
    let { dbExtra, tabService } = item;

    this.branches = new DbTableReader({
      key: 'branches',
      query: dbExtra.drizzle.query.branchesTable,
      defaultError: { code: 'BACKEND_BRANCH_DOES_NOT_EXIST' },
      convert: branchEnt => tabService.branchEntToTab({ branchEnt: branchEnt })
    });

    this.bridges = new DbTableReader({
      key: 'bridges',
      query: dbExtra.drizzle.query.bridgesTable,
      defaultError: { code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST' },
      convert: bridgeEnt => tabService.bridgeEntToTab({ bridgeEnt: bridgeEnt })
    });

    this.cachedColumns = new DbTableReader({
      key: 'cachedColumns',
      query: dbExtra.drizzle.query.cachedColumnsTable,
      defaultError: { code: 'BACKEND_CACHED_COLUMN_DOES_NOT_EXIST' },
      convert: cachedColumnEnt =>
        tabService.cachedColumnEntToTab({
          cachedColumnEnt: cachedColumnEnt
        })
    });

    this.cachedParts = new DbTableReader({
      key: 'cachedParts',
      query: dbExtra.drizzle.query.cachedPartsTable,
      defaultError: { code: 'BACKEND_CACHED_PART_DOES_NOT_EXIST' },
      convert: cachedPartEnt =>
        tabService.cachedPartEntToTab({ cachedPartEnt: cachedPartEnt })
    });

    this.charts = new DbTableReader({
      key: 'charts',
      query: dbExtra.drizzle.query.chartsTable,
      defaultError: { code: 'BACKEND_CHART_DOES_NOT_EXIST' },
      findExists: item =>
        dbExtra.drizzle.query.chartsTable.findFirst({
          ...item,
          columns: { chartId: true }
        }),
      convert: chartEnt => tabService.chartEntToTab({ chartEnt: chartEnt })
    });

    this.connections = new DbTableReader({
      key: 'connections',
      query: dbExtra.drizzle.query.connectionsTable,
      defaultError: { code: 'BACKEND_CONNECTION_DOES_NOT_EXIST' },
      convert: connectionEnt =>
        tabService.connectionEntToTab({ connectionEnt: connectionEnt })
    });

    this.dashboards = new DbTableReader({
      key: 'dashboards',
      query: dbExtra.drizzle.query.dashboardsTable,
      defaultError: { code: 'BACKEND_DASHBOARD_DOES_NOT_EXIST' },
      findExists: item =>
        dbExtra.drizzle.query.dashboardsTable.findFirst({
          ...item,
          columns: { dashboardId: true }
        }),
      convert: dashboardEnt =>
        tabService.dashboardEntToTab({ dashboardEnt: dashboardEnt })
    });

    this.dconfigs = new DbTableReader({
      key: 'dconfigs',
      query: dbExtra.drizzle.query.dconfigsTable,
      defaultError: { code: 'BACKEND_DCONFIG_DOES_NOT_EXIST' },
      convert: dconfigEnt =>
        tabService.dconfigEntToTab({ dconfigEnt: dconfigEnt })
    });

    this.envs = new DbTableReader({
      key: 'envs',
      query: dbExtra.drizzle.query.envsTable,
      defaultError: { code: 'BACKEND_ENV_DOES_NOT_EXIST' },
      convert: envEnt => tabService.envEntToTab({ envEnt: envEnt })
    });

    this.givens = new DbTableReader({
      key: 'givens',
      query: dbExtra.drizzle.query.givensTable,
      defaultError: { code: 'BACKEND_GIVEN_DOES_NOT_EXIST' },
      convert: givenEnt => tabService.givenEntToTab({ givenEnt: givenEnt })
    });

    this.kits = new DbTableReader({
      key: 'kits',
      query: dbExtra.drizzle.query.kitsTable,
      defaultError: { code: 'BACKEND_KIT_DOES_NOT_EXIST' },
      convert: kitEnt => tabService.kitEntToTab({ kitEnt: kitEnt })
    });

    this.mconfigs = new DbTableReader({
      key: 'mconfigs',
      query: dbExtra.drizzle.query.mconfigsTable,
      defaultError: { code: 'BACKEND_MCONFIG_DOES_NOT_EXIST' },
      convert: mconfigEnt =>
        tabService.mconfigEntToTab({ mconfigEnt: mconfigEnt })
    });

    this.members = new DbTableReader({
      key: 'members',
      query: dbExtra.drizzle.query.membersTable,
      defaultError: { code: 'BACKEND_MEMBER_DOES_NOT_EXIST' },
      convert: memberEnt => tabService.memberEntToTab({ memberEnt: memberEnt })
    });

    this.models = new DbTableReader({
      key: 'models',
      query: dbExtra.drizzle.query.modelsTable,
      defaultError: { code: 'BACKEND_MODEL_DOES_NOT_EXIST' },
      findExists: item =>
        dbExtra.drizzle.query.modelsTable.findFirst({
          ...item,
          columns: { modelId: true }
        }),
      convert: modelEnt => tabService.modelEntToTab({ modelEnt: modelEnt })
    });

    this.notes = new DbTableReader({
      key: 'notes',
      query: dbExtra.drizzle.query.notesTable,
      defaultError: { code: 'BACKEND_NOTE_DOES_NOT_EXIST' },
      convert: noteEnt => tabService.noteEntToTab({ noteEnt: noteEnt })
    });

    this.ocEvents = new DbTableReader({
      key: 'ocEvents',
      query: dbExtra.drizzle.query.ocEventsTable,
      defaultError: { code: 'BACKEND_OC_EVENT_DOES_NOT_EXIST' },
      convert: eventEnt => tabService.ocEventEntToTab({ eventEnt: eventEnt })
    });

    this.ocMessages = new DbTableReader({
      key: 'ocMessages',
      query: dbExtra.drizzle.query.ocMessagesTable,
      defaultError: { code: 'BACKEND_OC_MESSAGE_DOES_NOT_EXIST' },
      convert: messageEnt =>
        tabService.ocMessageEntToTab({ messageEnt: messageEnt })
    });

    this.ocParts = new DbTableReader({
      key: 'ocParts',
      query: dbExtra.drizzle.query.ocPartsTable,
      defaultError: { code: 'BACKEND_OC_PART_DOES_NOT_EXIST' },
      convert: partEnt => tabService.ocPartEntToTab({ partEnt: partEnt })
    });

    this.ocSessions = new DbTableReader({
      key: 'ocSessions',
      query: dbExtra.drizzle.query.ocSessionsTable,
      defaultError: { code: 'BACKEND_OC_SESSION_DOES_NOT_EXIST' },
      convert: ocSessionEnt =>
        tabService.ocSessionEntToTab({ ocSessionEnt: ocSessionEnt })
    });

    this.orgs = new DbTableReader({
      key: 'orgs',
      query: dbExtra.drizzle.query.orgsTable,
      defaultError: { code: 'BACKEND_ORG_DOES_NOT_EXIST' },
      convert: orgEnt => tabService.orgEntToTab({ orgEnt: orgEnt })
    });

    this.projects = new DbTableReader({
      key: 'projects',
      query: dbExtra.drizzle.query.projectsTable,
      defaultError: { code: 'BACKEND_PROJECT_DOES_NOT_EXIST' },
      convert: projectEnt =>
        tabService.projectEntToTab({ projectEnt: projectEnt })
    });

    this.providers = new DbTableReader({
      key: 'providers',
      query: dbExtra.drizzle.query.providersTable,
      defaultError: { code: 'BACKEND_PROVIDER_DOES_NOT_EXIST' },
      convert: providerEnt =>
        tabService.providerEntToTab({ providerEnt: providerEnt })
    });

    this.queries = new DbTableReader({
      key: 'queries',
      query: dbExtra.drizzle.query.queriesTable,
      defaultError: { code: 'BACKEND_QUERY_DOES_NOT_EXIST' },
      convert: queryEnt => tabService.queryEntToTab({ queryEnt: queryEnt })
    });

    this.reports = new DbTableReader({
      key: 'reports',
      query: dbExtra.drizzle.query.reportsTable,
      defaultError: { code: 'BACKEND_REPORT_NOT_FOUND' },
      findExists: item =>
        dbExtra.drizzle.query.reportsTable.findFirst({
          ...item,
          columns: { reportId: true }
        }),
      convert: reportEnt => tabService.reportEntToTab({ reportEnt: reportEnt })
    });

    this.roles = new DbTableReader({
      key: 'roles',
      query: dbExtra.drizzle.query.rolesTable,
      defaultError: { code: 'BACKEND_ROLE_DOES_NOT_EXIST' },
      convert: roleEnt => tabService.roleEntToTab({ roleEnt: roleEnt })
    });

    this.sessions = new DbTableReader({
      key: 'sessions',
      query: dbExtra.drizzle.query.sessionsTable,
      defaultError: { code: 'BACKEND_SESSION_NOT_FOUND' },
      findExists: item =>
        dbExtra.drizzle.query.sessionsTable.findFirst({
          ...item,
          columns: { sessionId: true }
        }),
      convert: sessionEnt =>
        tabService.sessionEntToTab({ sessionEnt: sessionEnt })
    });

    this.structs = new DbTableReader({
      key: 'structs',
      query: dbExtra.drizzle.query.structsTable,
      defaultError: { code: 'BACKEND_STRUCT_DOES_NOT_EXIST' },
      convert: structEnt => tabService.structEntToTab({ structEnt: structEnt })
    });

    this.uconfigs = new DbTableReader({
      key: 'uconfigs',
      query: dbExtra.drizzle.query.uconfigsTable,
      defaultError: { code: 'BACKEND_UCONFIG_DOES_NOT_EXIST' },
      convert: uconfigEnt =>
        tabService.uconfigEntToTab({ uconfigEnt: uconfigEnt })
    });

    this.avatars = new DbTableReader({
      key: 'avatars',
      query: dbExtra.drizzle.query.avatarsTable,
      defaultError: { code: 'BACKEND_AVATAR_DOES_NOT_EXIST' },
      convert: avatarEnt => tabService.avatarEntToTab({ avatarEnt: avatarEnt })
    });

    this.users = new DbTableReader({
      key: 'users',
      query: dbExtra.drizzle.query.usersTable,
      defaultError: { code: 'BACKEND_USER_DOES_NOT_EXIST' },
      convert: userEnt => tabService.userEntToTab({ userEnt: userEnt })
    });
  }
}
