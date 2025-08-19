import { ExtractTablesWithRelations, SQLWrapper, eq } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { forEachSeries } from 'p-iteration';
import { schemaPostgres } from '~backend/drizzle/postgres/schema/_schema-postgres';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { refreshServerTs } from '~backend/functions/refresh-server-ts';
import { DbRecords } from '~backend/interfaces/db-records';
import { isDefined } from '~common/functions/is-defined';
import { drizzleSetAllColumnsFull } from './drizzle-set-all-columns-full';
import { setUndefinedToNull } from './drizzle-set-undefined-to-null';
import { avatarsTable } from './schema/avatars';
import { branchesTable } from './schema/branches';
import { bridgesTable } from './schema/bridges';
import { chartsTable } from './schema/charts';
import { connectionsTable } from './schema/connections';
import { dashboardsTable } from './schema/dashboards';
import { envsTable } from './schema/envs';
import { kitsTable } from './schema/kits';
import { mconfigsTable } from './schema/mconfigs';
import { membersTable } from './schema/members';
import { modelsTable } from './schema/models';
import { notesTable } from './schema/notes';
import { orgsTable } from './schema/orgs';
import { projectsTable } from './schema/projects';
import { queriesTable } from './schema/queries';
import { reportsTable } from './schema/reports';
import { structsTable } from './schema/structs';
import { usersTable } from './schema/users';

// let retry = require('async-retry');

export interface RecordsPack {
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schemaPostgres,
    ExtractTablesWithRelations<typeof schemaPostgres>
  >;
  insert?: DbRecords;
  update?: DbRecords;
  insertOrUpdate?: DbRecords;
  insertOrDoNothing?: DbRecords;
  rawQueries?: SQLWrapper[];
  serverTs?: number;
}

export interface RecordsPackOutput {
  insert?: DbRecords;
  update?: DbRecords;
  insertOrUpdate?: DbRecords;
  insertOrDoNothing?: DbRecords;
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
      insertOrUpdate: insOrUpdRecords,
      insertOrDoNothing: insOrDoNothingRecords,
      rawQueries: rawQueries,
      serverTs: serverTs
    } = item;

    let newServerTs = isDefined(serverTs) ? serverTs : makeTsNumber();

    if (isDefined(insertRecords)) {
      Object.keys(insertRecords).forEach(key => {
        if (isDefined(insertRecords[key as keyof DbRecords])) {
          refreshServerTs(
            insertRecords[key as keyof DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        isDefined(insertRecords.avatars) &&
        insertRecords.avatars.length > 0
      ) {
        await tx.insert(avatarsTable).values(insertRecords.avatars);
      }

      if (
        isDefined(insertRecords.branches) &&
        insertRecords.branches.length > 0
      ) {
        await tx.insert(branchesTable).values(insertRecords.branches);
      }

      if (
        isDefined(insertRecords.bridges) &&
        insertRecords.bridges.length > 0
      ) {
        await tx.insert(bridgesTable).values(insertRecords.bridges);
      }

      if (
        isDefined(insertRecords.connections) &&
        insertRecords.connections.length > 0
      ) {
        await tx.insert(connectionsTable).values(insertRecords.connections);
      }

      if (
        isDefined(insertRecords.dashboards) &&
        insertRecords.dashboards.length > 0
      ) {
        await tx.insert(dashboardsTable).values(insertRecords.dashboards);
      }

      if (isDefined(insertRecords.envs) && insertRecords.envs.length > 0) {
        await tx.insert(envsTable).values(insertRecords.envs);
      }

      if (isDefined(insertRecords.kits) && insertRecords.kits.length > 0) {
        await tx.insert(kitsTable).values(insertRecords.kits);
      }

      if (
        isDefined(insertRecords.mconfigs) &&
        insertRecords.mconfigs.length > 0
      ) {
        await tx.insert(mconfigsTable).values(insertRecords.mconfigs);
      }

      if (
        isDefined(insertRecords.members) &&
        insertRecords.members.length > 0
      ) {
        await tx.insert(membersTable).values(insertRecords.members);
      }

      if (isDefined(insertRecords.models) && insertRecords.models.length > 0) {
        await tx.insert(modelsTable).values(insertRecords.models);
      }

      if (isDefined(insertRecords.notes) && insertRecords.notes.length > 0) {
        await tx.insert(notesTable).values(insertRecords.notes);
      }

      if (isDefined(insertRecords.orgs) && insertRecords.orgs.length > 0) {
        await tx.insert(orgsTable).values(insertRecords.orgs);
      }

      if (
        isDefined(insertRecords.projects) &&
        insertRecords.projects.length > 0
      ) {
        await tx.insert(projectsTable).values(insertRecords.projects);
      }

      if (
        isDefined(insertRecords.queries) &&
        insertRecords.queries.length > 0
      ) {
        await tx.insert(queriesTable).values(insertRecords.queries);
      }

      if (
        isDefined(insertRecords.reports) &&
        insertRecords.reports.length > 0
      ) {
        await tx.insert(reportsTable).values(insertRecords.reports);
      }

      if (
        isDefined(insertRecords.structs) &&
        insertRecords.structs.length > 0
      ) {
        await tx.insert(structsTable).values(insertRecords.structs);
      }

      if (isDefined(insertRecords.users) && insertRecords.users.length > 0) {
        await tx.insert(usersTable).values(insertRecords.users);
      }

      if (isDefined(insertRecords.charts) && insertRecords.charts.length > 0) {
        await tx.insert(chartsTable).values(insertRecords.charts);
      }
    }

    //
    //
    //

    if (isDefined(updateRecords)) {
      Object.keys(updateRecords).forEach(key => {
        if (isDefined(updateRecords[key as keyof DbRecords])) {
          refreshServerTs(
            updateRecords[key as keyof DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        isDefined(updateRecords.avatars) &&
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
        isDefined(updateRecords.branches) &&
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
        isDefined(updateRecords.bridges) &&
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
            .where(eq(bridgesTable.bridgeFullId, x.bridgeFullId));
        });
      }

      if (
        isDefined(updateRecords.connections) &&
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
        isDefined(updateRecords.dashboards) &&
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

      if (isDefined(updateRecords.envs) && updateRecords.envs.length > 0) {
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

      if (isDefined(updateRecords.kits) && updateRecords.kits.length > 0) {
        updateRecords.kits = setUndefinedToNull({
          ents: updateRecords.kits,
          table: kitsTable
        });

        await forEachSeries(updateRecords.kits, async x => {
          await tx.update(kitsTable).set(x).where(eq(kitsTable.kitId, x.kitId));
        });
      }

      if (
        isDefined(updateRecords.mconfigs) &&
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
        isDefined(updateRecords.members) &&
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

      if (isDefined(updateRecords.models) && updateRecords.models.length > 0) {
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

      if (isDefined(updateRecords.notes) && updateRecords.notes.length > 0) {
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

      if (isDefined(updateRecords.orgs) && updateRecords.orgs.length > 0) {
        updateRecords.orgs = setUndefinedToNull({
          ents: updateRecords.orgs,
          table: orgsTable
        });

        await forEachSeries(updateRecords.orgs, async x => {
          await tx.update(orgsTable).set(x).where(eq(orgsTable.orgId, x.orgId));
        });
      }

      if (
        isDefined(updateRecords.projects) &&
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
        isDefined(updateRecords.queries) &&
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
        isDefined(updateRecords.reports) &&
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
        isDefined(updateRecords.structs) &&
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

      if (isDefined(updateRecords.users) && updateRecords.users.length > 0) {
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

      if (isDefined(updateRecords.charts) && updateRecords.charts.length > 0) {
        updateRecords.charts = setUndefinedToNull({
          ents: updateRecords.charts,
          table: chartsTable
        });

        await forEachSeries(updateRecords.charts, async x => {
          await tx
            .update(chartsTable)
            .set(x)
            .where(eq(chartsTable.chartFullId, x.chartFullId));
        });
      }
    }

    //
    //
    //

    if (isDefined(insOrUpdRecords)) {
      Object.keys(insOrUpdRecords).forEach(key => {
        if (isDefined(insOrUpdRecords[key as keyof DbRecords])) {
          refreshServerTs(
            insOrUpdRecords[key as keyof DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        isDefined(insOrUpdRecords.avatars) &&
        insOrUpdRecords.avatars.length > 0
      ) {
        insOrUpdRecords.avatars = Array.from(
          new Set(insOrUpdRecords.avatars.map(x => x.userId))
        ).map(id => insOrUpdRecords.avatars.find(x => x.userId === id));

        insOrUpdRecords.avatars = setUndefinedToNull({
          ents: insOrUpdRecords.avatars,
          table: avatarsTable
        });

        await tx
          .insert(avatarsTable)
          .values(insOrUpdRecords.avatars)
          .onConflictDoUpdate({
            target: avatarsTable.userId,
            set: drizzleSetAllColumnsFull({ table: avatarsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.branches) &&
        insOrUpdRecords.branches.length > 0
      ) {
        insOrUpdRecords.branches = Array.from(
          new Set(insOrUpdRecords.branches.map(x => x.branchFullId))
        ).map(id => insOrUpdRecords.branches.find(x => x.branchFullId === id));

        insOrUpdRecords.branches = setUndefinedToNull({
          ents: insOrUpdRecords.branches,
          table: branchesTable
        });

        await tx
          .insert(branchesTable)
          .values(insOrUpdRecords.branches)
          .onConflictDoUpdate({
            target: branchesTable.branchFullId,
            set: drizzleSetAllColumnsFull({ table: branchesTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.bridges) &&
        insOrUpdRecords.bridges.length > 0
      ) {
        insOrUpdRecords.bridges = Array.from(
          new Set(insOrUpdRecords.bridges.map(x => x.bridgeFullId))
        ).map(id => insOrUpdRecords.bridges.find(x => x.bridgeFullId === id));

        insOrUpdRecords.bridges = setUndefinedToNull({
          ents: insOrUpdRecords.bridges,
          table: bridgesTable
        });

        await tx
          .insert(bridgesTable)
          .values(insOrUpdRecords.bridges)
          .onConflictDoUpdate({
            target: bridgesTable.bridgeFullId,
            set: drizzleSetAllColumnsFull({ table: bridgesTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.connections) &&
        insOrUpdRecords.connections.length > 0
      ) {
        insOrUpdRecords.connections = Array.from(
          new Set(insOrUpdRecords.connections.map(x => x.connectionFullId))
        ).map(id =>
          insOrUpdRecords.connections.find(x => x.connectionFullId === id)
        );

        insOrUpdRecords.connections = setUndefinedToNull({
          ents: insOrUpdRecords.connections,
          table: connectionsTable
        });

        await tx
          .insert(connectionsTable)
          .values(insOrUpdRecords.connections)
          .onConflictDoUpdate({
            target: connectionsTable.connectionFullId,
            set: drizzleSetAllColumnsFull({ table: connectionsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.dashboards) &&
        insOrUpdRecords.dashboards.length > 0
      ) {
        insOrUpdRecords.dashboards = Array.from(
          new Set(insOrUpdRecords.dashboards.map(x => x.dashboardFullId))
        ).map(id =>
          insOrUpdRecords.dashboards.find(x => x.dashboardFullId === id)
        );

        insOrUpdRecords.dashboards = setUndefinedToNull({
          ents: insOrUpdRecords.dashboards,
          table: dashboardsTable
        });

        await tx
          .insert(dashboardsTable)
          .values(insOrUpdRecords.dashboards)
          .onConflictDoUpdate({
            target: dashboardsTable.dashboardFullId,
            set: drizzleSetAllColumnsFull({ table: dashboardsTable })
          });
      }

      if (isDefined(insOrUpdRecords.envs) && insOrUpdRecords.envs.length > 0) {
        insOrUpdRecords.envs = Array.from(
          new Set(insOrUpdRecords.envs.map(x => x.envFullId))
        ).map(id => insOrUpdRecords.envs.find(x => x.envFullId === id));

        insOrUpdRecords.envs = setUndefinedToNull({
          ents: insOrUpdRecords.envs,
          table: envsTable
        });

        await tx
          .insert(envsTable)
          .values(insOrUpdRecords.envs)
          .onConflictDoUpdate({
            target: envsTable.envFullId,
            set: drizzleSetAllColumnsFull({ table: envsTable })
          });
      }

      if (isDefined(insOrUpdRecords.kits) && insOrUpdRecords.kits.length > 0) {
        insOrUpdRecords.kits = Array.from(
          new Set(insOrUpdRecords.kits.map(x => x.kitId))
        ).map(id => insOrUpdRecords.kits.find(x => x.kitId === id));

        insOrUpdRecords.kits = setUndefinedToNull({
          ents: insOrUpdRecords.kits,
          table: kitsTable
        });

        await tx
          .insert(kitsTable)
          .values(insOrUpdRecords.kits)
          .onConflictDoUpdate({
            target: kitsTable.kitId,
            set: drizzleSetAllColumnsFull({ table: kitsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.mconfigs) &&
        insOrUpdRecords.mconfigs.length > 0
      ) {
        insOrUpdRecords.mconfigs = Array.from(
          new Set(insOrUpdRecords.mconfigs.map(x => x.mconfigId))
        ).map(id => insOrUpdRecords.mconfigs.find(x => x.mconfigId === id));

        insOrUpdRecords.mconfigs = setUndefinedToNull({
          ents: insOrUpdRecords.mconfigs,
          table: mconfigsTable
        });

        await tx
          .insert(mconfigsTable)
          .values(insOrUpdRecords.mconfigs)
          .onConflictDoUpdate({
            target: mconfigsTable.mconfigId,
            set: drizzleSetAllColumnsFull({ table: mconfigsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.members) &&
        insOrUpdRecords.members.length > 0
      ) {
        insOrUpdRecords.members = Array.from(
          new Set(insOrUpdRecords.members.map(x => x.memberFullId))
        ).map(id => insOrUpdRecords.members.find(x => x.memberFullId === id));

        insOrUpdRecords.members = setUndefinedToNull({
          ents: insOrUpdRecords.members,
          table: membersTable
        });

        await tx
          .insert(membersTable)
          .values(insOrUpdRecords.members)
          .onConflictDoUpdate({
            target: membersTable.memberFullId,
            set: drizzleSetAllColumnsFull({ table: membersTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.models) &&
        insOrUpdRecords.models.length > 0
      ) {
        insOrUpdRecords.models = Array.from(
          new Set(insOrUpdRecords.models.map(x => x.modelFullId))
        ).map(id => insOrUpdRecords.models.find(x => x.modelFullId === id));

        insOrUpdRecords.models = setUndefinedToNull({
          ents: insOrUpdRecords.models,
          table: modelsTable
        });

        await tx
          .insert(modelsTable)
          .values(insOrUpdRecords.models)
          .onConflictDoUpdate({
            target: modelsTable.modelFullId,
            set: drizzleSetAllColumnsFull({ table: modelsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.notes) &&
        insOrUpdRecords.notes.length > 0
      ) {
        insOrUpdRecords.notes = Array.from(
          new Set(insOrUpdRecords.notes.map(x => x.noteId))
        ).map(id => insOrUpdRecords.notes.find(x => x.noteId === id));

        insOrUpdRecords.notes = setUndefinedToNull({
          ents: insOrUpdRecords.notes,
          table: notesTable
        });

        await tx
          .insert(notesTable)
          .values(insOrUpdRecords.notes)
          .onConflictDoUpdate({
            target: notesTable.noteId,
            set: drizzleSetAllColumnsFull({ table: notesTable })
          });
      }

      if (isDefined(insOrUpdRecords.orgs) && insOrUpdRecords.orgs.length > 0) {
        insOrUpdRecords.orgs = Array.from(
          new Set(insOrUpdRecords.orgs.map(x => x.orgId))
        ).map(id => insOrUpdRecords.orgs.find(x => x.orgId === id));

        insOrUpdRecords.orgs = setUndefinedToNull({
          ents: insOrUpdRecords.orgs,
          table: orgsTable
        });

        await tx
          .insert(orgsTable)
          .values(insOrUpdRecords.orgs)
          .onConflictDoUpdate({
            target: orgsTable.orgId,
            set: drizzleSetAllColumnsFull({ table: orgsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.projects) &&
        insOrUpdRecords.projects.length > 0
      ) {
        insOrUpdRecords.projects = Array.from(
          new Set(insOrUpdRecords.projects.map(x => x.projectId))
        ).map(id => insOrUpdRecords.projects.find(x => x.projectId === id));

        insOrUpdRecords.projects = setUndefinedToNull({
          ents: insOrUpdRecords.projects,
          table: projectsTable
        });

        await tx
          .insert(projectsTable)
          .values(insOrUpdRecords.projects)
          .onConflictDoUpdate({
            target: projectsTable.projectId,
            set: drizzleSetAllColumnsFull({ table: projectsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.queries) &&
        insOrUpdRecords.queries.length > 0
      ) {
        insOrUpdRecords.queries = Array.from(
          new Set(insOrUpdRecords.queries.map(x => x.queryId))
        ).map(id => insOrUpdRecords.queries.find(x => x.queryId === id));

        insOrUpdRecords.queries = setUndefinedToNull({
          ents: insOrUpdRecords.queries,
          table: queriesTable
        });

        await tx
          .insert(queriesTable)
          .values(insOrUpdRecords.queries)
          .onConflictDoUpdate({
            target: queriesTable.queryId,
            set: drizzleSetAllColumnsFull({ table: queriesTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.reports) &&
        insOrUpdRecords.reports.length > 0
      ) {
        insOrUpdRecords.reports = Array.from(
          new Set(insOrUpdRecords.reports.map(x => x.reportFullId))
        ).map(id => insOrUpdRecords.reports.find(x => x.reportFullId === id));

        insOrUpdRecords.reports = setUndefinedToNull({
          ents: insOrUpdRecords.reports,
          table: reportsTable
        });

        await tx
          .insert(reportsTable)
          .values(insOrUpdRecords.reports)
          .onConflictDoUpdate({
            target: reportsTable.reportFullId,
            set: drizzleSetAllColumnsFull({ table: reportsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.structs) &&
        insOrUpdRecords.structs.length > 0
      ) {
        insOrUpdRecords.structs = Array.from(
          new Set(insOrUpdRecords.structs.map(x => x.structId))
        ).map(id => insOrUpdRecords.structs.find(x => x.structId === id));

        insOrUpdRecords.structs = setUndefinedToNull({
          ents: insOrUpdRecords.structs,
          table: structsTable
        });

        await tx
          .insert(structsTable)
          .values(insOrUpdRecords.structs)
          .onConflictDoUpdate({
            target: structsTable.structId,
            set: drizzleSetAllColumnsFull({ table: structsTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.users) &&
        insOrUpdRecords.users.length > 0
      ) {
        insOrUpdRecords.users = Array.from(
          new Set(insOrUpdRecords.users.map(x => x.userId))
        ).map(id => insOrUpdRecords.users.find(x => x.userId === id));

        insOrUpdRecords.users = setUndefinedToNull({
          ents: insOrUpdRecords.users,
          table: usersTable
        });

        await tx
          .insert(usersTable)
          .values(insOrUpdRecords.users)
          .onConflictDoUpdate({
            target: usersTable.userId,
            set: drizzleSetAllColumnsFull({ table: usersTable })
          });
      }

      if (
        isDefined(insOrUpdRecords.charts) &&
        insOrUpdRecords.charts.length > 0
      ) {
        insOrUpdRecords.charts = Array.from(
          new Set(insOrUpdRecords.charts.map(x => x.chartFullId))
        ).map(id => insOrUpdRecords.charts.find(x => x.chartFullId === id));

        insOrUpdRecords.charts = setUndefinedToNull({
          ents: insOrUpdRecords.charts,
          table: chartsTable
        });

        await tx
          .insert(chartsTable)
          .values(insOrUpdRecords.charts)
          .onConflictDoUpdate({
            target: chartsTable.chartFullId,
            set: drizzleSetAllColumnsFull({ table: chartsTable })
          });
      }
    }

    //
    //
    //

    if (isDefined(insOrDoNothingRecords)) {
      Object.keys(insOrDoNothingRecords).forEach(key => {
        if (isDefined(insOrDoNothingRecords[key as keyof DbRecords])) {
          refreshServerTs(
            insOrDoNothingRecords[key as keyof DbRecords] as any,
            newServerTs
          );
        }
      });

      if (
        isDefined(insOrDoNothingRecords.queries) &&
        insOrDoNothingRecords.queries.length > 0
      ) {
        insOrDoNothingRecords.queries = Array.from(
          new Set(insOrDoNothingRecords.queries.map(x => x.queryId))
        ).map(id => insOrDoNothingRecords.queries.find(x => x.queryId === id));

        insOrDoNothingRecords.queries = setUndefinedToNull({
          ents: insOrDoNothingRecords.queries,
          table: queriesTable
        });

        await tx
          .insert(queriesTable)
          .values(insOrDoNothingRecords.queries)
          .onConflictDoNothing();
      }
    }
    //
    //
    //

    if (isDefined(rawQueries)) {
      await forEachSeries(rawQueries, async x => {
        await tx.execute(x);
      });
    }

    let pack: RecordsPackOutput = {
      insert: insertRecords,
      update: updateRecords,
      insertOrUpdate: insOrUpdRecords
    };

    return pack;
  }
}
