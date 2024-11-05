import { ExtractTablesWithRelations, SQLWrapper, eq } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { forEachSeries } from 'p-iteration';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { refreshServerTs } from '~backend/functions/refresh-server-ts';
import { drizzleSetAllColumnsFull } from './drizzle-set-all-columns-full';
import { setUndefinedToNull } from './drizzle-set-undefined-to-null';
import { avatarsTable } from './schema/avatars';
import { branchesTable } from './schema/branches';
import { bridgesTable } from './schema/bridges';
import { connectionsTable } from './schema/connections';
import { dashboardsTable } from './schema/dashboards';
import { envsTable } from './schema/envs';
import { evsTable } from './schema/evs';
import { kitsTable } from './schema/kits';
import { mconfigsTable } from './schema/mconfigs';
import { membersTable } from './schema/members';
import { metricsTable } from './schema/metrics';
import { modelsTable } from './schema/models';
import { notesTable } from './schema/notes';
import { orgsTable } from './schema/orgs';
import { projectsTable } from './schema/projects';
import { queriesTable } from './schema/queries';
import { reportsTable } from './schema/reports';
import { structsTable } from './schema/structs';
import { usersTable } from './schema/users';
import { vizsTable } from './schema/vizs';

// let retry = require('async-retry');

export interface RecordsPack {
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schemaPostgres,
    ExtractTablesWithRelations<typeof schemaPostgres>
  >;
  insert?: interfaces.DbRecords;
  update?: interfaces.DbRecords;
  insertOrUpdate?: interfaces.DbRecords;
  rawQueries?: SQLWrapper[];
  serverTs?: number;
}

export interface RecordsPackOutput {
  insert?: interfaces.DbRecords;
  update?: interfaces.DbRecords;
  insertOrUpdate?: interfaces.DbRecords;
  rawQueries?: SQLWrapper[];
  serverTs?: number;
}

export class DrizzlePacker {
  constructor() {}

  async write(item: RecordsPack): Promise<RecordsPackOutput> {
    let {
      tx: tx,
      insert: insertRecords,
      update: updateRecords,
      insertOrUpdate: insertOrUpdateRecords,
      rawQueries: rawQueries,
      serverTs: serverTs
    } = item;

    let newServerTs = common.isDefined(serverTs) ? serverTs : makeTsNumber();

    if (common.isDefined(insertRecords)) {
      Object.keys(insertRecords).forEach(key => {
        if (
          common.isDefined(insertRecords[key as keyof interfaces.DbRecords])
        ) {
          refreshServerTs(
            insertRecords[key as keyof interfaces.DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        common.isDefined(insertRecords.avatars) &&
        insertRecords.avatars.length > 0
      ) {
        await tx.insert(avatarsTable).values(insertRecords.avatars);
      }

      if (
        common.isDefined(insertRecords.branches) &&
        insertRecords.branches.length > 0
      ) {
        await tx.insert(branchesTable).values(insertRecords.branches);
      }

      if (
        common.isDefined(insertRecords.bridges) &&
        insertRecords.bridges.length > 0
      ) {
        await tx.insert(bridgesTable).values(insertRecords.bridges);
      }

      if (
        common.isDefined(insertRecords.connections) &&
        insertRecords.connections.length > 0
      ) {
        await tx.insert(connectionsTable).values(insertRecords.connections);
      }

      if (
        common.isDefined(insertRecords.dashboards) &&
        insertRecords.dashboards.length > 0
      ) {
        await tx.insert(dashboardsTable).values(insertRecords.dashboards);
      }

      if (
        common.isDefined(insertRecords.envs) &&
        insertRecords.envs.length > 0
      ) {
        await tx.insert(envsTable).values(insertRecords.envs);
      }

      if (common.isDefined(insertRecords.evs) && insertRecords.evs.length > 0) {
        await tx.insert(evsTable).values(insertRecords.evs);
      }

      if (
        common.isDefined(insertRecords.kits) &&
        insertRecords.kits.length > 0
      ) {
        await tx.insert(kitsTable).values(insertRecords.kits);
      }

      if (
        common.isDefined(insertRecords.mconfigs) &&
        insertRecords.mconfigs.length > 0
      ) {
        await tx.insert(mconfigsTable).values(insertRecords.mconfigs);
      }

      if (
        common.isDefined(insertRecords.members) &&
        insertRecords.members.length > 0
      ) {
        await tx.insert(membersTable).values(insertRecords.members);
      }

      if (
        common.isDefined(insertRecords.metrics) &&
        insertRecords.metrics.length > 0
      ) {
        await tx.insert(metricsTable).values(insertRecords.metrics);
      }

      if (
        common.isDefined(insertRecords.models) &&
        insertRecords.models.length > 0
      ) {
        await tx.insert(modelsTable).values(insertRecords.models);
      }

      if (
        common.isDefined(insertRecords.notes) &&
        insertRecords.notes.length > 0
      ) {
        await tx.insert(notesTable).values(insertRecords.notes);
      }

      if (
        common.isDefined(insertRecords.orgs) &&
        insertRecords.orgs.length > 0
      ) {
        await tx.insert(orgsTable).values(insertRecords.orgs);
      }

      if (
        common.isDefined(insertRecords.projects) &&
        insertRecords.projects.length > 0
      ) {
        await tx.insert(projectsTable).values(insertRecords.projects);
      }

      if (
        common.isDefined(insertRecords.queries) &&
        insertRecords.queries.length > 0
      ) {
        await tx.insert(queriesTable).values(insertRecords.queries);
      }

      if (
        common.isDefined(insertRecords.reports) &&
        insertRecords.reports.length > 0
      ) {
        await tx.insert(reportsTable).values(insertRecords.reports);
      }

      if (
        common.isDefined(insertRecords.structs) &&
        insertRecords.structs.length > 0
      ) {
        await tx.insert(structsTable).values(insertRecords.structs);
      }

      if (
        common.isDefined(insertRecords.users) &&
        insertRecords.users.length > 0
      ) {
        await tx.insert(usersTable).values(insertRecords.users);
      }

      if (
        common.isDefined(insertRecords.vizs) &&
        insertRecords.vizs.length > 0
      ) {
        await tx.insert(vizsTable).values(insertRecords.vizs);
      }
    }

    //
    //
    //

    if (common.isDefined(updateRecords)) {
      Object.keys(updateRecords).forEach(key => {
        if (
          common.isDefined(updateRecords[key as keyof interfaces.DbRecords])
        ) {
          refreshServerTs(
            updateRecords[key as keyof interfaces.DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        common.isDefined(updateRecords.avatars) &&
        updateRecords.avatars.length > 0
      ) {
        updateRecords.avatars = setUndefinedToNull({
          ents: updateRecords.avatars,
          table: avatarsTable
        });

        await forEachSeries(updateRecords.avatars, async x => {
          await tx
            .update(avatarsTable)
            .set(x)
            .where(eq(avatarsTable.userId, x.userId));
        });
      }

      if (
        common.isDefined(updateRecords.branches) &&
        updateRecords.branches.length > 0
      ) {
        updateRecords.branches = setUndefinedToNull({
          ents: updateRecords.branches,
          table: branchesTable
        });

        await forEachSeries(updateRecords.branches, async x => {
          await tx
            .update(branchesTable)
            .set(x)
            .where(eq(branchesTable.branchFullId, x.branchFullId));
        });
      }

      if (
        common.isDefined(updateRecords.bridges) &&
        updateRecords.bridges.length > 0
      ) {
        updateRecords.bridges = setUndefinedToNull({
          ents: updateRecords.bridges,
          table: bridgesTable
        });

        await forEachSeries(updateRecords.bridges, async x => {
          await tx
            .update(bridgesTable)
            .set(x)
            .where(eq(bridgesTable.bridgeId, x.bridgeId));
        });
      }

      if (
        common.isDefined(updateRecords.connections) &&
        updateRecords.connections.length > 0
      ) {
        updateRecords.connections = setUndefinedToNull({
          ents: updateRecords.connections,
          table: connectionsTable
        });

        await forEachSeries(updateRecords.connections, async x => {
          await tx
            .update(connectionsTable)
            .set(x)
            .where(eq(connectionsTable.connectionFullId, x.connectionFullId));
        });
      }

      if (
        common.isDefined(updateRecords.dashboards) &&
        updateRecords.dashboards.length > 0
      ) {
        updateRecords.dashboards = setUndefinedToNull({
          ents: updateRecords.dashboards,
          table: dashboardsTable
        });

        await forEachSeries(updateRecords.dashboards, async x => {
          await tx
            .update(dashboardsTable)
            .set(x)
            .where(eq(dashboardsTable.dashboardFullId, x.dashboardFullId));
        });
      }

      if (
        common.isDefined(updateRecords.envs) &&
        updateRecords.envs.length > 0
      ) {
        updateRecords.envs = setUndefinedToNull({
          ents: updateRecords.envs,
          table: envsTable
        });

        await forEachSeries(updateRecords.envs, async x => {
          await tx
            .update(envsTable)
            .set(x)
            .where(eq(envsTable.envFullId, x.envFullId));
        });
      }

      if (common.isDefined(updateRecords.evs) && updateRecords.evs.length > 0) {
        updateRecords.evs = setUndefinedToNull({
          ents: updateRecords.evs,
          table: evsTable
        });

        await forEachSeries(updateRecords.evs, async x => {
          await tx
            .update(evsTable)
            .set(x)
            .where(eq(evsTable.evFullId, x.evFullId));
        });
      }

      if (
        common.isDefined(updateRecords.kits) &&
        updateRecords.kits.length > 0
      ) {
        updateRecords.kits = setUndefinedToNull({
          ents: updateRecords.kits,
          table: kitsTable
        });

        await forEachSeries(updateRecords.kits, async x => {
          await tx.update(kitsTable).set(x).where(eq(kitsTable.kitId, x.kitId));
        });
      }

      if (
        common.isDefined(updateRecords.mconfigs) &&
        updateRecords.mconfigs.length > 0
      ) {
        updateRecords.mconfigs = setUndefinedToNull({
          ents: updateRecords.mconfigs,
          table: mconfigsTable
        });

        await forEachSeries(updateRecords.mconfigs, async x => {
          await tx
            .update(mconfigsTable)
            .set(x)
            .where(eq(mconfigsTable.mconfigId, x.mconfigId));
        });
      }

      if (
        common.isDefined(updateRecords.members) &&
        updateRecords.members.length > 0
      ) {
        updateRecords.members = setUndefinedToNull({
          ents: updateRecords.members,
          table: membersTable
        });

        await forEachSeries(updateRecords.members, async x => {
          await tx
            .update(membersTable)
            .set(x)
            .where(eq(membersTable.memberFullId, x.memberFullId));
        });
      }

      if (
        common.isDefined(updateRecords.metrics) &&
        updateRecords.metrics.length > 0
      ) {
        updateRecords.metrics = setUndefinedToNull({
          ents: updateRecords.metrics,
          table: metricsTable
        });

        await forEachSeries(updateRecords.metrics, async x => {
          await tx
            .update(metricsTable)
            .set(x)
            .where(eq(metricsTable.metricFullId, x.metricFullId));
        });
      }

      if (
        common.isDefined(updateRecords.models) &&
        updateRecords.models.length > 0
      ) {
        updateRecords.models = setUndefinedToNull({
          ents: updateRecords.models,
          table: modelsTable
        });

        await forEachSeries(updateRecords.models, async x => {
          await tx
            .update(modelsTable)
            .set(x)
            .where(eq(modelsTable.modelFullId, x.modelFullId));
        });
      }

      if (
        common.isDefined(updateRecords.notes) &&
        updateRecords.notes.length > 0
      ) {
        updateRecords.notes = setUndefinedToNull({
          ents: updateRecords.notes,
          table: notesTable
        });

        await forEachSeries(updateRecords.notes, async x => {
          await tx
            .update(notesTable)
            .set(x)
            .where(eq(notesTable.noteId, x.noteId));
        });
      }

      if (
        common.isDefined(updateRecords.orgs) &&
        updateRecords.orgs.length > 0
      ) {
        updateRecords.orgs = setUndefinedToNull({
          ents: updateRecords.orgs,
          table: orgsTable
        });

        await forEachSeries(updateRecords.orgs, async x => {
          await tx.update(orgsTable).set(x).where(eq(orgsTable.orgId, x.orgId));
        });
      }

      if (
        common.isDefined(updateRecords.projects) &&
        updateRecords.projects.length > 0
      ) {
        updateRecords.projects = setUndefinedToNull({
          ents: updateRecords.projects,
          table: projectsTable
        });

        await forEachSeries(updateRecords.projects, async x => {
          await tx
            .update(projectsTable)
            .set(x)
            .where(eq(projectsTable.projectId, x.projectId));
        });
      }

      if (
        common.isDefined(updateRecords.queries) &&
        updateRecords.queries.length > 0
      ) {
        updateRecords.queries = setUndefinedToNull({
          ents: updateRecords.queries,
          table: queriesTable
        });

        await forEachSeries(updateRecords.queries, async x => {
          await tx
            .update(queriesTable)
            .set(x)
            .where(eq(queriesTable.queryId, x.queryId));
        });
      }

      if (
        common.isDefined(updateRecords.reports) &&
        updateRecords.reports.length > 0
      ) {
        updateRecords.reports = setUndefinedToNull({
          ents: updateRecords.reports,
          table: reportsTable
        });

        await forEachSeries(updateRecords.reports, async x => {
          await tx
            .update(reportsTable)
            .set(x)
            .where(eq(reportsTable.reportFullId, x.reportFullId));
        });
      }

      if (
        common.isDefined(updateRecords.structs) &&
        updateRecords.structs.length > 0
      ) {
        updateRecords.structs = setUndefinedToNull({
          ents: updateRecords.structs,
          table: structsTable
        });

        await forEachSeries(updateRecords.structs, async x => {
          await tx
            .update(structsTable)
            .set(x)
            .where(eq(structsTable.structId, x.structId));
        });
      }

      if (
        common.isDefined(updateRecords.users) &&
        updateRecords.users.length > 0
      ) {
        updateRecords.users = setUndefinedToNull({
          ents: updateRecords.users,
          table: usersTable
        });

        await forEachSeries(updateRecords.users, async x => {
          await tx
            .update(usersTable)
            .set(x)
            .where(eq(usersTable.userId, x.userId));
        });
      }

      if (
        common.isDefined(updateRecords.vizs) &&
        updateRecords.vizs.length > 0
      ) {
        updateRecords.vizs = setUndefinedToNull({
          ents: updateRecords.vizs,
          table: vizsTable
        });

        await forEachSeries(updateRecords.vizs, async x => {
          await tx
            .update(vizsTable)
            .set(x)
            .where(eq(vizsTable.vizFullId, x.vizFullId));
        });
      }
    }

    //
    //
    //

    if (common.isDefined(insertOrUpdateRecords)) {
      Object.keys(insertOrUpdateRecords).forEach(key => {
        if (
          common.isDefined(
            insertOrUpdateRecords[key as keyof interfaces.DbRecords]
          )
        ) {
          refreshServerTs(
            insertOrUpdateRecords[key as keyof interfaces.DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        common.isDefined(insertOrUpdateRecords.avatars) &&
        insertOrUpdateRecords.avatars.length > 0
      ) {
        insertOrUpdateRecords.avatars = setUndefinedToNull({
          ents: insertOrUpdateRecords.avatars,
          table: avatarsTable
        });

        await tx
          .insert(avatarsTable)
          .values(insertOrUpdateRecords.avatars)
          .onConflictDoUpdate({
            target: avatarsTable.userId,
            set: drizzleSetAllColumnsFull({ table: avatarsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.branches) &&
        insertOrUpdateRecords.branches.length > 0
      ) {
        insertOrUpdateRecords.branches = setUndefinedToNull({
          ents: insertOrUpdateRecords.branches,
          table: branchesTable
        });

        await tx
          .insert(branchesTable)
          .values(insertOrUpdateRecords.branches)
          .onConflictDoUpdate({
            target: branchesTable.branchFullId,
            set: drizzleSetAllColumnsFull({ table: branchesTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.bridges) &&
        insertOrUpdateRecords.bridges.length > 0
      ) {
        insertOrUpdateRecords.bridges = setUndefinedToNull({
          ents: insertOrUpdateRecords.bridges,
          table: bridgesTable
        });

        await tx
          .insert(bridgesTable)
          .values(insertOrUpdateRecords.bridges)
          .onConflictDoUpdate({
            target: bridgesTable.bridgeId,
            set: drizzleSetAllColumnsFull({ table: bridgesTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.connections) &&
        insertOrUpdateRecords.connections.length > 0
      ) {
        insertOrUpdateRecords.connections = setUndefinedToNull({
          ents: insertOrUpdateRecords.connections,
          table: connectionsTable
        });

        await tx
          .insert(connectionsTable)
          .values(insertOrUpdateRecords.connections)
          .onConflictDoUpdate({
            target: connectionsTable.connectionFullId,
            set: drizzleSetAllColumnsFull({ table: connectionsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.dashboards) &&
        insertOrUpdateRecords.dashboards.length > 0
      ) {
        insertOrUpdateRecords.dashboards = setUndefinedToNull({
          ents: insertOrUpdateRecords.dashboards,
          table: dashboardsTable
        });

        await tx
          .insert(dashboardsTable)
          .values(insertOrUpdateRecords.dashboards)
          .onConflictDoUpdate({
            target: dashboardsTable.dashboardFullId,
            set: drizzleSetAllColumnsFull({ table: dashboardsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.envs) &&
        insertOrUpdateRecords.envs.length > 0
      ) {
        insertOrUpdateRecords.envs = setUndefinedToNull({
          ents: insertOrUpdateRecords.envs,
          table: envsTable
        });

        await tx
          .insert(envsTable)
          .values(insertOrUpdateRecords.envs)
          .onConflictDoUpdate({
            target: envsTable.envFullId,
            set: drizzleSetAllColumnsFull({ table: envsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.evs) &&
        insertOrUpdateRecords.evs.length > 0
      ) {
        insertOrUpdateRecords.evs = setUndefinedToNull({
          ents: insertOrUpdateRecords.evs,
          table: evsTable
        });

        await tx
          .insert(evsTable)
          .values(insertOrUpdateRecords.evs)
          .onConflictDoUpdate({
            target: evsTable.evFullId,
            set: drizzleSetAllColumnsFull({ table: evsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.kits) &&
        insertOrUpdateRecords.kits.length > 0
      ) {
        insertOrUpdateRecords.kits = setUndefinedToNull({
          ents: insertOrUpdateRecords.kits,
          table: kitsTable
        });

        await tx
          .insert(kitsTable)
          .values(insertOrUpdateRecords.kits)
          .onConflictDoUpdate({
            target: kitsTable.kitId,
            set: drizzleSetAllColumnsFull({ table: kitsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.mconfigs) &&
        insertOrUpdateRecords.mconfigs.length > 0
      ) {
        insertOrUpdateRecords.mconfigs = setUndefinedToNull({
          ents: insertOrUpdateRecords.mconfigs,
          table: mconfigsTable
        });

        await tx
          .insert(mconfigsTable)
          .values(insertOrUpdateRecords.mconfigs)
          .onConflictDoUpdate({
            target: mconfigsTable.mconfigId,
            set: drizzleSetAllColumnsFull({ table: mconfigsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.members) &&
        insertOrUpdateRecords.members.length > 0
      ) {
        insertOrUpdateRecords.members = setUndefinedToNull({
          ents: insertOrUpdateRecords.members,
          table: membersTable
        });

        await tx
          .insert(membersTable)
          .values(insertOrUpdateRecords.members)
          .onConflictDoUpdate({
            target: membersTable.memberFullId,
            set: drizzleSetAllColumnsFull({ table: membersTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.metrics) &&
        insertOrUpdateRecords.metrics.length > 0
      ) {
        insertOrUpdateRecords.metrics = setUndefinedToNull({
          ents: insertOrUpdateRecords.metrics,
          table: metricsTable
        });

        await tx
          .insert(metricsTable)
          .values(insertOrUpdateRecords.metrics)
          .onConflictDoUpdate({
            target: metricsTable.metricFullId,
            set: drizzleSetAllColumnsFull({ table: metricsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.models) &&
        insertOrUpdateRecords.models.length > 0
      ) {
        insertOrUpdateRecords.models = setUndefinedToNull({
          ents: insertOrUpdateRecords.models,
          table: modelsTable
        });

        await tx
          .insert(modelsTable)
          .values(insertOrUpdateRecords.models)
          .onConflictDoUpdate({
            target: modelsTable.modelFullId,
            set: drizzleSetAllColumnsFull({ table: modelsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.notes) &&
        insertOrUpdateRecords.notes.length > 0
      ) {
        insertOrUpdateRecords.notes = setUndefinedToNull({
          ents: insertOrUpdateRecords.notes,
          table: notesTable
        });

        await tx
          .insert(notesTable)
          .values(insertOrUpdateRecords.notes)
          .onConflictDoUpdate({
            target: notesTable.noteId,
            set: drizzleSetAllColumnsFull({ table: notesTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.orgs) &&
        insertOrUpdateRecords.orgs.length > 0
      ) {
        insertOrUpdateRecords.orgs = setUndefinedToNull({
          ents: insertOrUpdateRecords.orgs,
          table: orgsTable
        });

        await tx
          .insert(orgsTable)
          .values(insertOrUpdateRecords.orgs)
          .onConflictDoUpdate({
            target: orgsTable.orgId,
            set: drizzleSetAllColumnsFull({ table: orgsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.projects) &&
        insertOrUpdateRecords.projects.length > 0
      ) {
        insertOrUpdateRecords.projects = setUndefinedToNull({
          ents: insertOrUpdateRecords.projects,
          table: projectsTable
        });

        await tx
          .insert(projectsTable)
          .values(insertOrUpdateRecords.projects)
          .onConflictDoUpdate({
            target: projectsTable.projectId,
            set: drizzleSetAllColumnsFull({ table: projectsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.queries) &&
        insertOrUpdateRecords.queries.length > 0
      ) {
        insertOrUpdateRecords.queries = setUndefinedToNull({
          ents: insertOrUpdateRecords.queries,
          table: queriesTable
        });

        await tx
          .insert(queriesTable)
          .values(insertOrUpdateRecords.queries)
          .onConflictDoUpdate({
            target: queriesTable.queryId,
            set: drizzleSetAllColumnsFull({ table: queriesTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.reports) &&
        insertOrUpdateRecords.reports.length > 0
      ) {
        insertOrUpdateRecords.reports = setUndefinedToNull({
          ents: insertOrUpdateRecords.reports,
          table: reportsTable
        });

        await tx
          .insert(reportsTable)
          .values(insertOrUpdateRecords.reports)
          .onConflictDoUpdate({
            target: reportsTable.reportFullId,
            set: drizzleSetAllColumnsFull({ table: reportsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.structs) &&
        insertOrUpdateRecords.structs.length > 0
      ) {
        insertOrUpdateRecords.structs = setUndefinedToNull({
          ents: insertOrUpdateRecords.structs,
          table: structsTable
        });

        await tx
          .insert(structsTable)
          .values(insertOrUpdateRecords.structs)
          .onConflictDoUpdate({
            target: structsTable.structId,
            set: drizzleSetAllColumnsFull({ table: structsTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.users) &&
        insertOrUpdateRecords.users.length > 0
      ) {
        insertOrUpdateRecords.users = setUndefinedToNull({
          ents: insertOrUpdateRecords.users,
          table: usersTable
        });

        await tx
          .insert(usersTable)
          .values(insertOrUpdateRecords.users)
          .onConflictDoUpdate({
            target: usersTable.userId,
            set: drizzleSetAllColumnsFull({ table: usersTable })
          });
      }

      if (
        common.isDefined(insertOrUpdateRecords.vizs) &&
        insertOrUpdateRecords.vizs.length > 0
      ) {
        insertOrUpdateRecords.vizs = setUndefinedToNull({
          ents: insertOrUpdateRecords.vizs,
          table: vizsTable
        });

        await tx
          .insert(vizsTable)
          .values(insertOrUpdateRecords.vizs)
          .onConflictDoUpdate({
            target: vizsTable.vizFullId,
            set: drizzleSetAllColumnsFull({ table: vizsTable })
          });
      }
    }

    //
    //
    //

    if (common.isDefined(rawQueries)) {
      await forEachSeries(rawQueries, async x => {
        await tx.execute(x);
      });
    }

    let pack: RecordsPackOutput = {
      insert: insertRecords,
      update: updateRecords,
      insertOrUpdate: insertOrUpdateRecords
    };

    return pack;
  }
}
