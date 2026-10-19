import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  and,
  desc,
  eq,
  isNotNull,
  isNull,
  lte,
  notInArray,
  or,
  sql
} from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type {
  AvatarTab,
  BranchTab,
  BridgeTab,
  CachedColumnTab,
  CachedPartTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  DconfigTab,
  EnvTab,
  KitTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  NoteTab,
  OcEventTab,
  OcMessageTab,
  OcPartTab,
  OcSessionTab,
  OrgTab,
  ProjectTab,
  ProviderTab,
  QueryTab,
  ReportTab,
  SessionTab,
  StructTab,
  UconfigTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { dconfigsTable } from '#backend/drizzle/postgres/schema/dconfigs';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { kitsTable } from '#backend/drizzle/postgres/schema/kits';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { notesTable } from '#backend/drizzle/postgres/schema/notes';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { structsTable } from '#backend/drizzle/postgres/schema/structs';
import { uconfigsTable } from '#backend/drizzle/postgres/schema/uconfigs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

@Injectable()
export class TabCheckerService {
  private keyTag: string;
  private prevKeyTag: string;
  private keyTags: string[];
  private isEncryptDb: boolean;
  private isEncryptMetadata: boolean;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {
    this.keyTag = this.cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

    this.prevKeyTag =
      this.cs.get<BackendConfig['prevAesKeyTag']>('prevAesKeyTag');

    this.keyTags = isDefined(this.prevKeyTag)
      ? [this.keyTag, this.prevKeyTag]
      : [this.keyTag];

    this.isEncryptDb = this.cs.get<BackendConfig['isEncryptDb']>('isEncryptDb');

    this.isEncryptMetadata =
      this.cs.get<BackendConfig['isEncryptMetadata']>('isEncryptMetadata');
  }

  async readWriteRecords(item: { isAllRecords: boolean }) {
    let { isAllRecords } = item;

    logToConsoleBackend({
      log: `TabChecker Started, isAllRecords: ${isAllRecords} ...`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });

    let startTs = Date.now();

    await this.checkAvatars(isAllRecords);
    await this.checkBranches(isAllRecords);
    await this.checkBridges(isAllRecords);
    await this.checkCachedColumns(isAllRecords);
    await this.checkCachedParts(isAllRecords);
    await this.checkConnections(isAllRecords);
    await this.checkDconfigs(isAllRecords);
    await this.checkUconfigs(isAllRecords);
    await this.checkEnvs(isAllRecords);
    await this.checkKits(isAllRecords);
    await this.checkMembers(isAllRecords);
    await this.checkNotes(isAllRecords);
    await this.checkOrgs(isAllRecords);
    await this.checkProjects(isAllRecords);
    await this.checkProviders(isAllRecords);
    await this.checkQueries(isAllRecords);
    await this.checkUsers(isAllRecords);
    await this.checkOcEvents(isAllRecords);
    await this.checkOcMessages(isAllRecords);
    await this.checkOcParts(isAllRecords);
    await this.checkSessions(isAllRecords);
    await this.checkOcSessions(isAllRecords);
    //
    await this.checkStructsMetadata(isAllRecords);
    await this.checkModelsMetadata(isAllRecords);
    await this.checkMconfigsMetadata(isAllRecords);
    await this.checkChartsMetadata(isAllRecords);
    await this.checkReportsMetadata(isAllRecords);
    await this.checkDashboardsMetadata(isAllRecords);

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker Completed, total ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkAvatars(isAllRecords: boolean) {
    let startTs = Date.now();

    let avatarLatest: AvatarTab = await this.db.avatars.findFirstUnwrap({
      orderBy: desc(avatarsTable.serverTs)
    });

    if (isUndefined(avatarLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(avatarsTable.serverTs, avatarLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(avatarsTable.keyTag),
              eq(avatarsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(avatarsTable.keyTag, this.keyTag),
              eq(avatarsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let avatar: AvatarTab = await this.db.avatars.findFirstUnwrap({
        where: where
      });

      if (isUndefined(avatar)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          avatars: [avatar]
        }
      });
    }

    let avatarResult = await this.db.drizzle
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

    if (avatarResult.length > 0 && avatarResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'avatars',
          count: avatarResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Avatars, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkBranches(isAllRecords: boolean) {
    let startTs = Date.now();
    let branchLatest: BranchTab = await this.db.branches.findFirstUnwrap({
      orderBy: desc(branchesTable.serverTs)
    });

    if (isUndefined(branchLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(branchesTable.serverTs, branchLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(branchesTable.keyTag),
              eq(branchesTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(branchesTable.keyTag, this.keyTag),
              eq(branchesTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let branch: BranchTab = await this.db.branches.findFirstUnwrap({
        where: where
      });

      if (isUndefined(branch)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          branches: [branch]
        }
      });
    }

    let branchResult = await this.db.drizzle
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

    if (branchResult.length > 0 && branchResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'branches',
          count: branchResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Branches, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkBridges(isAllRecords: boolean) {
    let startTs = Date.now();
    let bridgeLatest: BridgeTab = await this.db.bridges.findFirstUnwrap({
      orderBy: desc(bridgesTable.serverTs)
    });

    if (isUndefined(bridgeLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(bridgesTable.serverTs, bridgeLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(bridgesTable.keyTag),
              eq(bridgesTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(bridgesTable.keyTag, this.keyTag),
              eq(bridgesTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let bridge: BridgeTab = await this.db.bridges.findFirstUnwrap({
        where: where
      });

      if (isUndefined(bridge)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          bridges: [bridge]
        }
      });
    }

    let bridgeResult = await this.db.drizzle
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

    if (bridgeResult.length > 0 && bridgeResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'bridges',
          count: bridgeResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Bridges, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkCachedColumns(isAllRecords: boolean) {
    let startTs = Date.now();
    let cachedColumnLatest: CachedColumnTab =
      await this.db.cachedColumns.findFirstUnwrap({
        orderBy: desc(cachedColumnsTable.serverTs)
      });

    if (isUndefined(cachedColumnLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(cachedColumnsTable.serverTs, cachedColumnLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(cachedColumnsTable.keyTag),
              eq(cachedColumnsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(cachedColumnsTable.keyTag, this.keyTag),
              eq(cachedColumnsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let cachedColumn: CachedColumnTab =
        await this.db.cachedColumns.findFirstUnwrap({
          where: where
        });

      if (isUndefined(cachedColumn)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          cachedColumns: [cachedColumn]
        }
      });
    }

    let cachedColumnResult = await this.db.drizzle
      .select({
        record: cachedColumnsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(cachedColumnsTable)
      .where(
        and(
          isNotNull(cachedColumnsTable.keyTag),
          notInArray(cachedColumnsTable.keyTag, this.keyTags)
        )
      );

    if (cachedColumnResult.length > 0 && cachedColumnResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'cached_columns',
          count: cachedColumnResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Cached Columns, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkCachedParts(isAllRecords: boolean) {
    let startTs = Date.now();
    let cachedPartLatest: CachedPartTab =
      await this.db.cachedParts.findFirstUnwrap({
        orderBy: desc(cachedPartsTable.serverTs)
      });

    if (isUndefined(cachedPartLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(cachedPartsTable.serverTs, cachedPartLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(cachedPartsTable.keyTag),
              eq(cachedPartsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(cachedPartsTable.keyTag, this.keyTag),
              eq(cachedPartsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let cachedPart: CachedPartTab = await this.db.cachedParts.findFirstUnwrap(
        {
          where: where
        }
      );

      if (isUndefined(cachedPart)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          cachedParts: [cachedPart]
        }
      });
    }

    let cachedPartResult = await this.db.drizzle
      .select({
        record: cachedPartsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(cachedPartsTable)
      .where(
        and(
          isNotNull(cachedPartsTable.keyTag),
          notInArray(cachedPartsTable.keyTag, this.keyTags)
        )
      );

    if (cachedPartResult.length > 0 && cachedPartResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'cached_parts',
          count: cachedPartResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Cached Parts, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkConnections(isAllRecords: boolean) {
    let startTs = Date.now();
    let connectionLatest: ConnectionTab =
      await this.db.connections.findFirstUnwrap({
        orderBy: desc(connectionsTable.serverTs)
      });

    if (isUndefined(connectionLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(connectionsTable.serverTs, connectionLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(connectionsTable.keyTag),
              eq(connectionsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(connectionsTable.keyTag, this.keyTag),
              eq(connectionsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let connection: ConnectionTab = await this.db.connections.findFirstUnwrap(
        {
          where: where
        }
      );

      if (isUndefined(connection)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          connections: [connection]
        }
      });
    }

    let connectionResult = await this.db.drizzle
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

    if (connectionResult.length > 0 && connectionResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'connections',
          count: connectionResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Connections, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkDconfigs(isAllRecords: boolean) {
    let startTs = Date.now();
    let dconfigLatest: DconfigTab = await this.db.dconfigs.findFirstUnwrap({
      orderBy: desc(dconfigsTable.serverTs)
    });

    if (isUndefined(dconfigLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(dconfigsTable.serverTs, dconfigLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(dconfigsTable.keyTag),
              eq(dconfigsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(dconfigsTable.keyTag, this.keyTag),
              eq(dconfigsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let dconfig: DconfigTab = await this.db.dconfigs.findFirstUnwrap({
        where: where
      });

      if (isUndefined(dconfig)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          dconfigs: [dconfig]
        }
      });
    }

    let dconfigResult = await this.db.drizzle
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

    if (dconfigResult.length > 0 && dconfigResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'dconfigs',
          count: dconfigResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Dconfigs, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkUconfigs(isAllRecords: boolean) {
    let startTs = Date.now();
    let uconfigLatest: UconfigTab = await this.db.uconfigs.findFirstUnwrap({
      orderBy: desc(uconfigsTable.serverTs)
    });

    if (isUndefined(uconfigLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(uconfigsTable.serverTs, uconfigLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(uconfigsTable.keyTag),
              eq(uconfigsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(uconfigsTable.keyTag, this.keyTag),
              eq(uconfigsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let uconfig: UconfigTab = await this.db.uconfigs.findFirstUnwrap({
        where: where
      });

      if (isUndefined(uconfig)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          uconfigs: [uconfig]
        }
      });
    }

    let uconfigResult = await this.db.drizzle
      .select({
        record: uconfigsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(uconfigsTable)
      .where(
        and(
          isNotNull(uconfigsTable.keyTag),
          notInArray(uconfigsTable.keyTag, this.keyTags)
        )
      );

    if (uconfigResult.length > 0 && uconfigResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'uconfigs',
          count: uconfigResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Uconfigs, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkEnvs(isAllRecords: boolean) {
    let startTs = Date.now();
    let envLatest: EnvTab = await this.db.envs.findFirstUnwrap({
      orderBy: desc(envsTable.serverTs)
    });

    if (isUndefined(envLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(envsTable.serverTs, envLatest.serverTs)
        : this.isEncryptDb === true
          ? or(isNull(envsTable.keyTag), eq(envsTable.keyTag, this.prevKeyTag))
          : or(
              eq(envsTable.keyTag, this.keyTag),
              eq(envsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let env: EnvTab = await this.db.envs.findFirstUnwrap({
        where: where
      });

      if (isUndefined(env)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          envs: [env]
        }
      });
    }

    let envResult = await this.db.drizzle
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

    if (envResult.length > 0 && envResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'envs',
          count: envResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Envs, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkKits(isAllRecords: boolean) {
    let startTs = Date.now();
    let kitLatest: KitTab = await this.db.kits.findFirstUnwrap({
      orderBy: desc(kitsTable.serverTs)
    });

    if (isUndefined(kitLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(kitsTable.serverTs, kitLatest.serverTs)
        : this.isEncryptDb === true
          ? or(isNull(kitsTable.keyTag), eq(kitsTable.keyTag, this.prevKeyTag))
          : or(
              eq(kitsTable.keyTag, this.keyTag),
              eq(kitsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let kit: KitTab = await this.db.kits.findFirstUnwrap({
        where: where
      });

      if (isUndefined(kit)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          kits: [kit]
        }
      });
    }

    let kitResult = await this.db.drizzle
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

    if (kitResult.length > 0 && kitResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'kits',
          count: kitResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Kits, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkMembers(isAllRecords: boolean) {
    let startTs = Date.now();
    let memberLatest: MemberTab = await this.db.members.findFirstUnwrap({
      orderBy: desc(membersTable.serverTs)
    });

    if (isUndefined(memberLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(membersTable.serverTs, memberLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(membersTable.keyTag),
              eq(membersTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(membersTable.keyTag, this.keyTag),
              eq(membersTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let member: MemberTab = await this.db.members.findFirstUnwrap({
        where: where
      });

      if (isUndefined(member)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          members: [member]
        }
      });
    }

    let memberResult = await this.db.drizzle
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

    if (memberResult.length > 0 && memberResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'members',
          count: memberResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Members, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkNotes(isAllRecords: boolean) {
    let startTs = Date.now();
    let noteLatest: NoteTab = await this.db.notes.findFirstUnwrap({
      orderBy: desc(notesTable.serverTs)
    });

    if (isUndefined(noteLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(notesTable.serverTs, noteLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(notesTable.keyTag),
              eq(notesTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(notesTable.keyTag, this.keyTag),
              eq(notesTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let note: NoteTab = await this.db.notes.findFirstUnwrap({
        where: where
      });

      if (isUndefined(note)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          notes: [note]
        }
      });
    }

    let noteResult = await this.db.drizzle
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

    if (noteResult.length > 0 && noteResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'notes',
          count: noteResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Notes, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkOrgs(isAllRecords: boolean) {
    let startTs = Date.now();
    let orgLatest: OrgTab = await this.db.orgs.findFirstUnwrap({
      orderBy: desc(orgsTable.serverTs)
    });

    if (isUndefined(orgLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(orgsTable.serverTs, orgLatest.serverTs)
        : this.isEncryptDb === true
          ? or(isNull(orgsTable.keyTag), eq(orgsTable.keyTag, this.prevKeyTag))
          : or(
              eq(orgsTable.keyTag, this.keyTag),
              eq(orgsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let org: OrgTab = await this.db.orgs.findFirstUnwrap({
        where: where
      });

      if (isUndefined(org)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          orgs: [org]
        }
      });
    }

    let orgResult = await this.db.drizzle
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

    if (orgResult.length > 0 && orgResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'orgs',
          count: orgResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Orgs, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkProjects(isAllRecords: boolean) {
    let startTs = Date.now();
    let projectLatest: ProjectTab = await this.db.projects.findFirstUnwrap({
      orderBy: desc(projectsTable.serverTs)
    });

    if (isUndefined(projectLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(projectsTable.serverTs, projectLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(projectsTable.keyTag),
              eq(projectsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(projectsTable.keyTag, this.keyTag),
              eq(projectsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let project: ProjectTab = await this.db.projects.findFirstUnwrap({
        where: where
      });

      if (isUndefined(project)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          projects: [project]
        }
      });
    }

    let projectResult = await this.db.drizzle
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

    if (projectResult.length > 0 && projectResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'projects',
          count: projectResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Projects, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkProviders(isAllRecords: boolean) {
    let startTs = Date.now();
    let providerLatest: ProviderTab = await this.db.providers.findFirstUnwrap({
      orderBy: desc(providersTable.serverTs)
    });

    if (isUndefined(providerLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(providersTable.serverTs, providerLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(providersTable.keyTag),
              eq(providersTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(providersTable.keyTag, this.keyTag),
              eq(providersTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let provider: ProviderTab = await this.db.providers.findFirstUnwrap({
        where: where
      });

      if (isUndefined(provider)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          providers: [provider]
        }
      });
    }

    let providerResult = await this.db.drizzle
      .select({
        record: providersTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(providersTable)
      .where(
        and(
          isNotNull(providersTable.keyTag),
          notInArray(providersTable.keyTag, this.keyTags)
        )
      );

    if (providerResult.length > 0 && providerResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'providers',
          count: providerResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Providers, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkQueries(isAllRecords: boolean) {
    let startTs = Date.now();
    let queryLatest: QueryTab = await this.db.queries.findFirstUnwrap({
      orderBy: desc(queriesTable.serverTs)
    });

    if (isUndefined(queryLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(queriesTable.serverTs, queryLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(queriesTable.keyTag),
              eq(queriesTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(queriesTable.keyTag, this.keyTag),
              eq(queriesTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let query: QueryTab = await this.db.queries.findFirstUnwrap({
        where: where
      });

      if (isUndefined(query)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          queries: [query]
        }
      });
    }

    let queryResult = await this.db.drizzle
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

    if (queryResult.length > 0 && queryResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'queries',
          count: queryResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Queries, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkUsers(isAllRecords: boolean) {
    let startTs = Date.now();
    let userLatest: UserTab = await this.db.users.findFirstUnwrap({
      orderBy: desc(usersTable.serverTs)
    });

    if (isUndefined(userLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(usersTable.serverTs, userLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(usersTable.keyTag),
              eq(usersTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(usersTable.keyTag, this.keyTag),
              eq(usersTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let user: UserTab = await this.db.users.findFirstUnwrap({
        where: where
      });

      if (isUndefined(user)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          users: [user]
        }
      });
    }

    let userResult = await this.db.drizzle
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

    if (userResult.length > 0 && userResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'users',
          count: userResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Users, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkOcEvents(isAllRecords: boolean) {
    let startTs = Date.now();
    let eventLatest: OcEventTab = await this.db.ocEvents.findFirstUnwrap({
      orderBy: desc(ocEventsTable.serverTs)
    });

    if (isUndefined(eventLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(ocEventsTable.serverTs, eventLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(ocEventsTable.keyTag),
              eq(ocEventsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(ocEventsTable.keyTag, this.keyTag),
              eq(ocEventsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let event: OcEventTab = await this.db.ocEvents.findFirstUnwrap({
        where: where
      });

      if (isUndefined(event)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          ocEvents: [event]
        }
      });
    }

    let eventsResult = await this.db.drizzle
      .select({
        record: ocEventsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(ocEventsTable)
      .where(
        and(
          isNotNull(ocEventsTable.keyTag),
          notInArray(ocEventsTable.keyTag, this.keyTags)
        )
      );

    if (eventsResult.length > 0 && eventsResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'oc_events',
          count: eventsResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - OcEvents, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkOcMessages(isAllRecords: boolean) {
    let startTs = Date.now();
    let messageLatest: OcMessageTab = await this.db.ocMessages.findFirstUnwrap({
      orderBy: desc(ocMessagesTable.serverTs)
    });

    if (isUndefined(messageLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(ocMessagesTable.serverTs, messageLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(ocMessagesTable.keyTag),
              eq(ocMessagesTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(ocMessagesTable.keyTag, this.keyTag),
              eq(ocMessagesTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let message: OcMessageTab = await this.db.ocMessages.findFirstUnwrap({
        where: where
      });

      if (isUndefined(message)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          ocMessages: [message]
        }
      });
    }

    let messagesResult = await this.db.drizzle
      .select({
        record: ocMessagesTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(ocMessagesTable)
      .where(
        and(
          isNotNull(ocMessagesTable.keyTag),
          notInArray(ocMessagesTable.keyTag, this.keyTags)
        )
      );

    if (messagesResult.length > 0 && messagesResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'oc_messages',
          count: messagesResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - OcMessages, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkOcParts(isAllRecords: boolean) {
    let startTs = Date.now();
    let partLatest: OcPartTab = await this.db.ocParts.findFirstUnwrap({
      orderBy: desc(ocPartsTable.serverTs)
    });

    if (isUndefined(partLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(ocPartsTable.serverTs, partLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(ocPartsTable.keyTag),
              eq(ocPartsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(ocPartsTable.keyTag, this.keyTag),
              eq(ocPartsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let part: OcPartTab = await this.db.ocParts.findFirstUnwrap({
        where: where
      });

      if (isUndefined(part)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          ocParts: [part]
        }
      });
    }

    let partsResult = await this.db.drizzle
      .select({
        record: ocPartsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(ocPartsTable)
      .where(
        and(
          isNotNull(ocPartsTable.keyTag),
          notInArray(ocPartsTable.keyTag, this.keyTags)
        )
      );

    if (partsResult.length > 0 && partsResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'oc_parts',
          count: partsResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - OcParts, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkSessions(isAllRecords: boolean) {
    let startTs = Date.now();
    let sessionLatest: SessionTab = await this.db.sessions.findFirstUnwrap({
      orderBy: desc(sessionsTable.serverTs)
    });

    if (isUndefined(sessionLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(sessionsTable.serverTs, sessionLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(sessionsTable.keyTag),
              eq(sessionsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(sessionsTable.keyTag, this.keyTag),
              eq(sessionsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let session: SessionTab = await this.db.sessions.findFirstUnwrap({
        where: where
      });

      if (isUndefined(session)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          sessions: [session]
        }
      });
    }

    let sessionResult = await this.db.drizzle
      .select({
        record: sessionsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(sessionsTable)
      .where(
        and(
          isNotNull(sessionsTable.keyTag),
          notInArray(sessionsTable.keyTag, this.keyTags)
        )
      );

    if (sessionResult.length > 0 && sessionResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'sessions',
          count: sessionResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Sessions, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkOcSessions(isAllRecords: boolean) {
    let startTs = Date.now();
    let ocSessionLatest: OcSessionTab =
      await this.db.ocSessions.findFirstUnwrap({
        orderBy: desc(ocSessionsTable.serverTs)
      });

    if (isUndefined(ocSessionLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(ocSessionsTable.serverTs, ocSessionLatest.serverTs)
        : this.isEncryptDb === true
          ? or(
              isNull(ocSessionsTable.keyTag),
              eq(ocSessionsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(ocSessionsTable.keyTag, this.keyTag),
              eq(ocSessionsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let ocSession: OcSessionTab = await this.db.ocSessions.findFirstUnwrap({
        where: where
      });

      if (isUndefined(ocSession)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          ocSessions: [ocSession]
        }
      });
    }

    let ocSessionResult = await this.db.drizzle
      .select({
        record: ocSessionsTable,
        total: sql<number>`CAST(COUNT(*) OVER() AS INTEGER)`
      })
      .from(ocSessionsTable)
      .where(
        and(
          isNotNull(ocSessionsTable.keyTag),
          notInArray(ocSessionsTable.keyTag, this.keyTags)
        )
      );

    if (ocSessionResult.length > 0 && ocSessionResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'oc_sessions',
          count: ocSessionResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - OcSessions, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  //
  // metadata
  //

  async checkStructsMetadata(isAllRecords: boolean) {
    let startTs = Date.now();
    if (this.isEncryptMetadata === false) {
      let structEncrypted: StructTab = await this.db.structs.findFirstUnwrap({
        where: isNotNull(structsTable.keyTag)
      });

      if (isDefined(structEncrypted)) {
        isAllRecords = true;
      }
    }

    let structLatest: StructTab = await this.db.structs.findFirstUnwrap({
      orderBy: desc(structsTable.serverTs)
    });

    if (isUndefined(structLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(structsTable.serverTs, structLatest.serverTs)
        : this.isEncryptDb === true && this.isEncryptMetadata === true
          ? or(
              isNull(structsTable.keyTag),
              eq(structsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(structsTable.keyTag, this.keyTag),
              eq(structsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let struct: StructTab = await this.db.structs.findFirstUnwrap({
        where: where
      });

      if (isUndefined(struct)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          structs: [struct]
        }
      });
    }

    let structResult = await this.db.drizzle
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

    if (structResult.length > 0 && structResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'structs',
          count: structResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Structs, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkModelsMetadata(isAllRecords: boolean) {
    let startTs = Date.now();
    if (this.isEncryptMetadata === false) {
      let modelEncrypted: ModelTab = await this.db.models.findFirstUnwrap({
        where: isNotNull(modelsTable.keyTag)
      });

      if (isDefined(modelEncrypted)) {
        isAllRecords = true;
      }
    }

    let modelLatest: ModelTab = await this.db.models.findFirstUnwrap({
      orderBy: desc(modelsTable.serverTs)
    });

    if (isUndefined(modelLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(modelsTable.serverTs, modelLatest.serverTs)
        : this.isEncryptDb === true && this.isEncryptMetadata === true
          ? or(
              isNull(modelsTable.keyTag),
              eq(modelsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(modelsTable.keyTag, this.keyTag),
              eq(modelsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let model: ModelTab = await this.db.models.findFirstUnwrap({
        where: where
      });

      if (isUndefined(model)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          models: [model]
        }
      });
    }

    let modelResult = await this.db.drizzle
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

    if (modelResult.length > 0 && modelResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'models',
          count: modelResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Models, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkMconfigsMetadata(isAllRecords: boolean) {
    let startTs = Date.now();
    if (this.isEncryptMetadata === false) {
      let mconfigEncrypted: MconfigTab = await this.db.mconfigs.findFirstUnwrap(
        {
          where: isNotNull(mconfigsTable.keyTag)
        }
      );

      if (isDefined(mconfigEncrypted)) {
        isAllRecords = true;
      }
    }

    let mconfigLatest: MconfigTab = await this.db.mconfigs.findFirstUnwrap({
      orderBy: desc(mconfigsTable.serverTs)
    });

    if (isUndefined(mconfigLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(mconfigsTable.serverTs, mconfigLatest.serverTs)
        : this.isEncryptDb === true && this.isEncryptMetadata === true
          ? or(
              isNull(mconfigsTable.keyTag),
              eq(mconfigsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(mconfigsTable.keyTag, this.keyTag),
              eq(mconfigsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let mconfig: MconfigTab = await this.db.mconfigs.findFirstUnwrap({
        where: where
      });

      if (isUndefined(mconfig)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          mconfigs: [mconfig]
        }
      });
    }

    let mconfigResult = await this.db.drizzle
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

    if (mconfigResult.length > 0 && mconfigResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'mconfigs',
          count: mconfigResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Mconfigs, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkChartsMetadata(isAllRecords: boolean) {
    let startTs = Date.now();
    if (this.isEncryptMetadata === false) {
      let chartEncrypted: ChartTab = await this.db.charts.findFirstUnwrap({
        where: isNotNull(chartsTable.keyTag)
      });

      if (isDefined(chartEncrypted)) {
        isAllRecords = true;
      }
    }

    let chartLatest: ChartTab = await this.db.charts.findFirstUnwrap({
      orderBy: desc(chartsTable.serverTs)
    });

    if (isUndefined(chartLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(chartsTable.serverTs, chartLatest.serverTs)
        : this.isEncryptDb === true && this.isEncryptMetadata === true
          ? or(
              isNull(chartsTable.keyTag),
              eq(chartsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(chartsTable.keyTag, this.keyTag),
              eq(chartsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let chart: ChartTab = await this.db.charts.findFirstUnwrap({
        where: where
      });

      if (isUndefined(chart)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          charts: [chart]
        }
      });
    }

    let chartResult = await this.db.drizzle
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

    if (chartResult.length > 0 && chartResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'charts',
          count: chartResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Charts, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkReportsMetadata(isAllRecords: boolean) {
    let startTs = Date.now();
    if (this.isEncryptMetadata === false) {
      let reportEncrypted: ReportTab = await this.db.reports.findFirstUnwrap({
        where: isNotNull(reportsTable.keyTag)
      });

      if (isDefined(reportEncrypted)) {
        isAllRecords = true;
      }
    }

    let reportLatest: ReportTab = await this.db.reports.findFirstUnwrap({
      orderBy: desc(reportsTable.serverTs)
    });

    if (isUndefined(reportLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(reportsTable.serverTs, reportLatest.serverTs)
        : this.isEncryptDb === true && this.isEncryptMetadata === true
          ? or(
              isNull(reportsTable.keyTag),
              eq(reportsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(reportsTable.keyTag, this.keyTag),
              eq(reportsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let report: ReportTab = await this.db.reports.findFirstUnwrap({
        where: where
      });

      if (isUndefined(report)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          reports: [report]
        }
      });
    }

    let reportResult = await this.db.drizzle
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

    if (reportResult.length > 0 && reportResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'reports',
          count: reportResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Reports, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }

  async checkDashboardsMetadata(isAllRecords: boolean) {
    let startTs = Date.now();
    if (this.isEncryptMetadata === false) {
      let dashboardEncrypted: DashboardTab =
        await this.db.dashboards.findFirstUnwrap({
          where: isNotNull(dashboardsTable.keyTag)
        });

      if (isDefined(dashboardEncrypted)) {
        isAllRecords = true;
      }
    }

    let dashboardLatest: DashboardTab =
      await this.db.dashboards.findFirstUnwrap({
        orderBy: desc(dashboardsTable.serverTs)
      });

    if (isUndefined(dashboardLatest)) {
      return;
    }

    let where =
      isAllRecords === true
        ? lte(dashboardsTable.serverTs, dashboardLatest.serverTs)
        : this.isEncryptDb === true && this.isEncryptMetadata === true
          ? or(
              isNull(dashboardsTable.keyTag),
              eq(dashboardsTable.keyTag, this.prevKeyTag)
            )
          : or(
              eq(dashboardsTable.keyTag, this.keyTag),
              eq(dashboardsTable.keyTag, this.prevKeyTag)
            );

    while (true) {
      let dashboard: DashboardTab = await this.db.dashboards.findFirstUnwrap({
        where: where
      });

      if (isUndefined(dashboard)) {
        break;
      }

      await this.db.writeUnwrap({
        update: {
          dashboards: [dashboard]
        }
      });
    }

    let dashboardResult = await this.db.drizzle
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

    if (dashboardResult.length > 0 && dashboardResult[0].total > 0) {
      throw new ServerError({
        message:
          'BACKEND_DB_RECORDS_EXIST_WITH_KEY_TAGS_THAT_DO_NOT_MATCH_CURRENT_OR_PREV',
        customData: {
          table: 'dashboards',
          count: dashboardResult[0].total
        }
      });
    }

    let durationMs = Date.now() - startTs;

    logToConsoleBackend({
      log: `TabChecker - Dashboards, ${durationMs} ms`,
      logLevel: 'Info',
      logger: this.logger,
      cs: this.cs
    });
  }
}
