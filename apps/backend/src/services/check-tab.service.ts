import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, isNotNull, isNull, notInArray, or, sql } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { dconfigsTable } from '~backend/drizzle/postgres/schema/dconfigs';
import { envsTable } from '~backend/drizzle/postgres/schema/envs';
import { kitsTable } from '~backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { notesTable } from '~backend/drizzle/postgres/schema/notes';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '~backend/drizzle/postgres/schema/projects';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { structsTable } from '~backend/drizzle/postgres/schema/structs';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { BoolEnum } from '~common/enums/bool.enum';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ServerError } from '~common/models/server-error';
import { AvatarsService } from './db/avatars.service';
import { BranchesService } from './db/branches.service';
import { BridgesService } from './db/bridges.service';
import { ChartsService } from './db/charts.service';
import { ConnectionsService } from './db/connections.service';
import { DashboardsService } from './db/dashboards.service';
import { DconfigsService } from './db/dconfigs.service';
import { EnvsService } from './db/envs.service';
import { KitsService } from './db/kits.service';
import { MconfigsService } from './db/mconfigs.service';
import { MembersService } from './db/members.service';
import { ModelsService } from './db/models.service';
import { NotesService } from './db/notes.service';
import { OrgsService } from './db/orgs.service';
import { ProjectsService } from './db/projects.service';
import { QueriesService } from './db/queries.service';
import { ReportsService } from './db/reports.service';
import { StructsService } from './db/structs.service';
import { UsersService } from './db/users.service';

let retry = require('async-retry');

@Injectable()
export class CheckTabService {
  private keyTag: string;
  private prevKeyTag: string;
  private keyTags: string[];
  private isEncryption: boolean;

  constructor(
    private avatarsService: AvatarsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private chartsService: ChartsService,
    private connectionsService: ConnectionsService,
    private dashboardsService: DashboardsService,
    private dconfigsService: DconfigsService,
    private envsService: EnvsService,
    private kitsService: KitsService,
    private mconfigsService: MconfigsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private notesService: NotesService,
    private orgsService: OrgsService,
    private projectsService: ProjectsService,
    private queriesService: QueriesService,
    private reportsService: ReportsService,
    private structsService: StructsService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {
    this.keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    this.prevKeyTag =
      this.cs.get<BackendConfig['prevAesKeyTag']>('prevAesKeyTag');

    this.keyTags = isDefined(this.prevKeyTag)
      ? [this.keyTag, this.prevKeyTag]
      : [this.keyTag];

    this.isEncryption =
      this.cs.get<BackendConfig['isDbEncryptionEnabled']>(
        'isDbEncryptionEnabled'
      ) === BoolEnum.TRUE;
  }

  async checkRecords() {
    await this.checkAvatars();
    await this.checkBranches();
    await this.checkBridges();
    await this.checkCharts();
    await this.checkConnections();
    await this.checkDashboards();
    await this.checkEnvs();
    await this.checkKits();
    await this.checkMconfigs();
    await this.checkMembers();
    await this.checkModels();
    await this.checkNotes();
    await this.checkOrgs();
    await this.checkProjects();
    await this.checkQueries();
    await this.checkReports();
    await this.checkStructs();
    await this.checkUsers();
    await this.checkDconfigs(); // last
  }

  async checkAvatars() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(avatarsTable.keyTag),
            eq(avatarsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(avatarsTable.keyTag, this.keyTag),
            eq(avatarsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let avatar = await this.db.drizzle.query.avatarsTable
        .findFirst({ where: where })
        .then(x => this.avatarsService.entToTab(x));

      if (isUndefined(avatar)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  avatars: [avatar]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let avatarsResult = await this.db.drizzle
      .select({
        record: avatarsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(avatarsTable)
      .where(
        and(
          isNotNull(avatarsTable.keyTag),
          notInArray(avatarsTable.keyTag, this.keyTags)
        )
      );

    if (avatarsResult.length > 0 && avatarsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'avatars',
          count: avatarsResult[0].total
        }
      });
    }
  }

  async checkBranches() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(branchesTable.keyTag),
            eq(branchesTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(branchesTable.keyTag, this.keyTag),
            eq(branchesTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let branch = await this.db.drizzle.query.branchesTable
        .findFirst({ where: where })
        .then(x => this.branchesService.entToTab(x));

      if (isUndefined(branch)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  branches: [branch]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let branchesResult = await this.db.drizzle
      .select({
        record: branchesTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(branchesTable)
      .where(
        and(
          isNotNull(branchesTable.keyTag),
          notInArray(branchesTable.keyTag, this.keyTags)
        )
      );

    if (branchesResult.length > 0 && branchesResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'branches',
          count: branchesResult[0].total
        }
      });
    }
  }

  async checkBridges() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(bridgesTable.keyTag),
            eq(bridgesTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(bridgesTable.keyTag, this.keyTag),
            eq(bridgesTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let bridge = await this.db.drizzle.query.bridgesTable
        .findFirst({ where: where })
        .then(x => this.bridgesService.entToTab(x));

      if (isUndefined(bridge)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  bridges: [bridge]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let bridgesResult = await this.db.drizzle
      .select({
        record: bridgesTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(bridgesTable)
      .where(
        and(
          isNotNull(bridgesTable.keyTag),
          notInArray(bridgesTable.keyTag, this.keyTags)
        )
      );

    if (bridgesResult.length > 0 && bridgesResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'bridges',
          count: bridgesResult[0].total
        }
      });
    }
  }

  async checkCharts() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(chartsTable.keyTag),
            eq(chartsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(chartsTable.keyTag, this.keyTag),
            eq(chartsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let chart = await this.db.drizzle.query.chartsTable
        .findFirst({ where: where })
        .then(x => this.chartsService.entToTab(x));

      if (isUndefined(chart)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  charts: [chart]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let chartsResult = await this.db.drizzle
      .select({
        record: chartsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(chartsTable)
      .where(
        and(
          isNotNull(chartsTable.keyTag),
          notInArray(chartsTable.keyTag, this.keyTags)
        )
      );

    if (chartsResult.length > 0 && chartsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'charts',
          count: chartsResult[0].total
        }
      });
    }
  }

  async checkConnections() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(connectionsTable.keyTag),
            eq(connectionsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(connectionsTable.keyTag, this.keyTag),
            eq(connectionsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let connection = await this.db.drizzle.query.connectionsTable
        .findFirst({ where: where })
        .then(x => this.connectionsService.entToTab(x));

      if (isUndefined(connection)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  connections: [connection]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let connectionsResult = await this.db.drizzle
      .select({
        record: connectionsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(connectionsTable)
      .where(
        and(
          isNotNull(connectionsTable.keyTag),
          notInArray(connectionsTable.keyTag, this.keyTags)
        )
      );

    if (connectionsResult.length > 0 && connectionsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'connections',
          count: connectionsResult[0].total
        }
      });
    }
  }

  async checkDashboards() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(dashboardsTable.keyTag),
            eq(dashboardsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(dashboardsTable.keyTag, this.keyTag),
            eq(dashboardsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let dashboard = await this.db.drizzle.query.dashboardsTable
        .findFirst({ where: where })
        .then(x => this.dashboardsService.entToTab(x));

      if (isUndefined(dashboard)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  dashboards: [dashboard]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let dashboardsResult = await this.db.drizzle
      .select({
        record: dashboardsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(dashboardsTable)
      .where(
        and(
          isNotNull(dashboardsTable.keyTag),
          notInArray(dashboardsTable.keyTag, this.keyTags)
        )
      );

    if (dashboardsResult.length > 0 && dashboardsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'dashboards',
          count: dashboardsResult[0].total
        }
      });
    }
  }

  async checkDconfigs() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(dconfigsTable.keyTag),
            eq(dconfigsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(dconfigsTable.keyTag, this.keyTag),
            eq(dconfigsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let dconfig = await this.db.drizzle.query.dconfigsTable
        .findFirst({ where: where })
        .then(x => this.dconfigsService.entToTab(x));

      if (isUndefined(dconfig)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  dconfigs: [dconfig]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let dconfigsResult = await this.db.drizzle
      .select({
        record: dconfigsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(dconfigsTable)
      .where(
        and(
          isNotNull(dconfigsTable.keyTag),
          notInArray(dconfigsTable.keyTag, this.keyTags)
        )
      );

    if (dconfigsResult.length > 0 && dconfigsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'dconfigs',
          count: dconfigsResult[0].total
        }
      });
    }
  }

  async checkEnvs() {
    let where =
      this.isEncryption === true
        ? or(isNull(envsTable.keyTag), eq(envsTable.keyTag, this.prevKeyTag))
        : or(
            eq(envsTable.keyTag, this.keyTag),
            eq(envsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let env = await this.db.drizzle.query.envsTable
        .findFirst({ where: where })
        .then(x => this.envsService.entToTab(x));

      if (isUndefined(env)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  envs: [env]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let envsResult = await this.db.drizzle
      .select({
        record: envsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(envsTable)
      .where(
        and(
          isNotNull(envsTable.keyTag),
          notInArray(envsTable.keyTag, this.keyTags)
        )
      );

    if (envsResult.length > 0 && envsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'envs',
          count: envsResult[0].total
        }
      });
    }
  }

  async checkKits() {
    let where =
      this.isEncryption === true
        ? or(isNull(kitsTable.keyTag), eq(kitsTable.keyTag, this.prevKeyTag))
        : or(
            eq(kitsTable.keyTag, this.keyTag),
            eq(kitsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let kit = await this.db.drizzle.query.kitsTable
        .findFirst({ where: where })
        .then(x => this.kitsService.entToTab(x));

      if (isUndefined(kit)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  kits: [kit]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let kitsResult = await this.db.drizzle
      .select({
        record: kitsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(kitsTable)
      .where(
        and(
          isNotNull(kitsTable.keyTag),
          notInArray(kitsTable.keyTag, this.keyTags)
        )
      );

    if (kitsResult.length > 0 && kitsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'kits',
          count: kitsResult[0].total
        }
      });
    }
  }

  async checkMconfigs() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(mconfigsTable.keyTag),
            eq(mconfigsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(mconfigsTable.keyTag, this.keyTag),
            eq(mconfigsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let mconfig = await this.db.drizzle.query.mconfigsTable
        .findFirst({ where: where })
        .then(x => this.mconfigsService.entToTab(x));

      if (isUndefined(mconfig)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  mconfigs: [mconfig]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let mconfigsResult = await this.db.drizzle
      .select({
        record: mconfigsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(mconfigsTable)
      .where(
        and(
          isNotNull(mconfigsTable.keyTag),
          notInArray(mconfigsTable.keyTag, this.keyTags)
        )
      );

    if (mconfigsResult.length > 0 && mconfigsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'mconfigs',
          count: mconfigsResult[0].total
        }
      });
    }
  }

  async checkMembers() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(membersTable.keyTag),
            eq(membersTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(membersTable.keyTag, this.keyTag),
            eq(membersTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let member = await this.db.drizzle.query.membersTable
        .findFirst({ where: where })
        .then(x => this.membersService.entToTab(x));

      if (isUndefined(member)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  members: [member]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let membersResult = await this.db.drizzle
      .select({
        record: membersTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(membersTable)
      .where(
        and(
          isNotNull(membersTable.keyTag),
          notInArray(membersTable.keyTag, this.keyTags)
        )
      );

    if (membersResult.length > 0 && membersResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'members',
          count: membersResult[0].total
        }
      });
    }
  }

  async checkModels() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(modelsTable.keyTag),
            eq(modelsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(modelsTable.keyTag, this.keyTag),
            eq(modelsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let model = await this.db.drizzle.query.modelsTable
        .findFirst({ where: where })
        .then(x => this.modelsService.entToTab(x));

      if (isUndefined(model)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  models: [model]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let modelsResult = await this.db.drizzle
      .select({
        record: modelsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(modelsTable)
      .where(
        and(
          isNotNull(modelsTable.keyTag),
          notInArray(modelsTable.keyTag, this.keyTags)
        )
      );

    if (modelsResult.length > 0 && modelsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'models',
          count: modelsResult[0].total
        }
      });
    }
  }

  async checkNotes() {
    let where =
      this.isEncryption === true
        ? or(isNull(notesTable.keyTag), eq(notesTable.keyTag, this.prevKeyTag))
        : or(
            eq(notesTable.keyTag, this.keyTag),
            eq(notesTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let note = await this.db.drizzle.query.notesTable
        .findFirst({ where: where })
        .then(x => this.notesService.entToTab(x));

      if (isUndefined(note)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  notes: [note]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let notesResult = await this.db.drizzle
      .select({
        record: notesTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(notesTable)
      .where(
        and(
          isNotNull(notesTable.keyTag),
          notInArray(notesTable.keyTag, this.keyTags)
        )
      );

    if (notesResult.length > 0 && notesResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'notes',
          count: notesResult[0].total
        }
      });
    }
  }

  async checkOrgs() {
    let where =
      this.isEncryption === true
        ? or(isNull(orgsTable.keyTag), eq(orgsTable.keyTag, this.prevKeyTag))
        : or(
            eq(orgsTable.keyTag, this.keyTag),
            eq(orgsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let org = await this.db.drizzle.query.orgsTable
        .findFirst({ where: where })
        .then(x => this.orgsService.entToTab(x));

      if (isUndefined(org)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  orgs: [org]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let orgsResult = await this.db.drizzle
      .select({
        record: orgsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(orgsTable)
      .where(
        and(
          isNotNull(orgsTable.keyTag),
          notInArray(orgsTable.keyTag, this.keyTags)
        )
      );

    if (orgsResult.length > 0 && orgsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'orgs',
          count: orgsResult[0].total
        }
      });
    }
  }

  async checkProjects() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(projectsTable.keyTag),
            eq(projectsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(projectsTable.keyTag, this.keyTag),
            eq(projectsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let project = await this.db.drizzle.query.projectsTable
        .findFirst({ where: where })
        .then(x => this.projectsService.entToTab(x));

      if (isUndefined(project)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  projects: [project]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let projectsResult = await this.db.drizzle
      .select({
        record: projectsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(projectsTable)
      .where(
        and(
          isNotNull(projectsTable.keyTag),
          notInArray(projectsTable.keyTag, this.keyTags)
        )
      );

    if (projectsResult.length > 0 && projectsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'projects',
          count: projectsResult[0].total
        }
      });
    }
  }

  async checkQueries() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(queriesTable.keyTag),
            eq(queriesTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(queriesTable.keyTag, this.keyTag),
            eq(queriesTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let query = await this.db.drizzle.query.queriesTable
        .findFirst({ where: where })
        .then(x => this.queriesService.entToTab(x));

      if (isUndefined(query)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  queries: [query]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let queriesResult = await this.db.drizzle
      .select({
        record: queriesTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(queriesTable)
      .where(
        and(
          isNotNull(queriesTable.keyTag),
          notInArray(queriesTable.keyTag, this.keyTags)
        )
      );

    if (queriesResult.length > 0 && queriesResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'queries',
          count: queriesResult[0].total
        }
      });
    }
  }

  async checkReports() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(reportsTable.keyTag),
            eq(reportsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(reportsTable.keyTag, this.keyTag),
            eq(reportsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let report = await this.db.drizzle.query.reportsTable
        .findFirst({ where: where })
        .then(x => this.reportsService.entToTab(x));

      if (isUndefined(report)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  reports: [report]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let reportsResult = await this.db.drizzle
      .select({
        record: reportsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(reportsTable)
      .where(
        and(
          isNotNull(reportsTable.keyTag),
          notInArray(reportsTable.keyTag, this.keyTags)
        )
      );

    if (reportsResult.length > 0 && reportsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'reports',
          count: reportsResult[0].total
        }
      });
    }
  }

  async checkStructs() {
    let where =
      this.isEncryption === true
        ? or(
            isNull(structsTable.keyTag),
            eq(structsTable.keyTag, this.prevKeyTag)
          )
        : or(
            eq(structsTable.keyTag, this.keyTag),
            eq(structsTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let struct = await this.db.drizzle.query.structsTable
        .findFirst({ where: where })
        .then(x => this.structsService.entToTab(x));

      if (isUndefined(struct)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  structs: [struct]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let structsResult = await this.db.drizzle
      .select({
        record: structsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(structsTable)
      .where(
        and(
          isNotNull(structsTable.keyTag),
          notInArray(structsTable.keyTag, this.keyTags)
        )
      );

    if (structsResult.length > 0 && structsResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'structs',
          count: structsResult[0].total
        }
      });
    }
  }

  async checkUsers() {
    let where =
      this.isEncryption === true
        ? or(isNull(usersTable.keyTag), eq(usersTable.keyTag, this.prevKeyTag))
        : or(
            eq(usersTable.keyTag, this.keyTag),
            eq(usersTable.keyTag, this.prevKeyTag)
          );

    while (true) {
      let user = await this.db.drizzle.query.usersTable
        .findFirst({ where: where })
        .then(x => this.usersService.entToTab(x));

      if (isUndefined(user)) {
        break;
      }

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: {
                  users: [user]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let usersResult = await this.db.drizzle
      .select({
        record: usersTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(usersTable)
      .where(
        and(
          isNotNull(usersTable.keyTag),
          notInArray(usersTable.keyTag, this.keyTags)
        )
      );

    if (usersResult.length > 0 && usersResult[0].total > 0) {
      throw new ServerError({
        message:
          ErEnum.BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV,
        customData: {
          table: 'users',
          count: usersResult[0].total
        }
      });
    }
  }
}
