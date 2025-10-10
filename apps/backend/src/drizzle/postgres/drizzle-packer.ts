import { ExtractTablesWithRelations, SQLWrapper, eq } from 'drizzle-orm';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { forEachSeries } from 'p-iteration';
import { schemaPostgres } from '~backend/drizzle/postgres/schema/_schema-postgres';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { DbEntsPack } from '~backend/interfaces/db-ents-pack';
import { DbTabsPack } from '~backend/interfaces/db-tabs-pack';
import { TabToEntService } from '~backend/services/tab-to-ent.service';
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

export interface PackerInput {
  tx: PgTransaction<
    NodePgQueryResultHKT,
    typeof schemaPostgres,
    ExtractTablesWithRelations<typeof schemaPostgres>
  >;
  insert?: DbTabsPack;
  update?: DbTabsPack;
  insertOrUpdate?: DbTabsPack;
  insertOrDoNothing?: DbTabsPack;
  rawQueries?: SQLWrapper[];
  serverTs?: number;
}

export interface PackerOutput {
  insert?: DbTabsPack;
  update?: DbTabsPack;
  insertOrUpdate?: DbTabsPack;
  insertOrDoNothing?: DbTabsPack;
  rawQueries?: SQLWrapper[];
  serverTs?: number;
}

export class DrizzlePacker {
  constructor(private tabToEntService: TabToEntService) {}

  private refreshServerTs<T extends { serverTs: number }>(item: {
    elements: T[];
    newServerTs: number;
  }) {
    let { elements, newServerTs } = item;

    elements?.forEach(element => {
      element.serverTs = newServerTs;
    });
  }

  async write(item: PackerInput): Promise<PackerOutput> {
    let {
      tx,
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs
    } = item;

    let insertEnts =
      isDefined(insert) && Object.keys(insert).length > 0
        ? this.tabToEntService.tabsPackToEntsPack(insert)
        : undefined;

    let updateEnts =
      isDefined(update) && Object.keys(update).length > 0
        ? this.tabToEntService.tabsPackToEntsPack(update)
        : undefined;

    let insOrUpdEnts =
      isDefined(insertOrUpdate) && Object.keys(insertOrUpdate).length > 0
        ? this.tabToEntService.tabsPackToEntsPack(insertOrUpdate)
        : undefined;

    let insOrDoNothingEnts =
      isDefined(insertOrDoNothing) && Object.keys(insertOrDoNothing).length > 0
        ? this.tabToEntService.tabsPackToEntsPack(insertOrDoNothing)
        : undefined;

    let newServerTs = isDefined(serverTs) ? serverTs : makeTsNumber();

    if (isDefined(insertEnts)) {
      Object.keys(insertEnts).forEach(key => {
        this.refreshServerTs({
          elements: (insertEnts[key as keyof DbEntsPack] as any[]) ?? [],
          newServerTs: newServerTs
        });
      });
    }

    if (isDefined(updateEnts)) {
      Object.keys(updateEnts).forEach(key => {
        this.refreshServerTs({
          elements: (updateEnts[key as keyof DbEntsPack] as any[]) ?? [],
          newServerTs: newServerTs
        });
      });
    }

    if (isDefined(insOrUpdEnts)) {
      Object.keys(insOrUpdEnts).forEach(key => {
        this.refreshServerTs({
          elements: (insOrUpdEnts[key as keyof DbEntsPack] as any[]) ?? [],
          newServerTs: newServerTs
        });
      });
    }

    if (isDefined(insOrDoNothingEnts)) {
      Object.keys(insOrDoNothingEnts).forEach(key => {
        this.refreshServerTs({
          elements:
            (insOrDoNothingEnts[key as keyof DbEntsPack] as any[]) ?? [],
          newServerTs: newServerTs
        });
      });
    }

    if (isDefined(insertEnts)) {
      if (insertEnts.avatars.length > 0) {
        await tx.insert(avatarsTable).values(insertEnts.avatars);
      }

      if (insertEnts.branches.length > 0) {
        await tx.insert(branchesTable).values(insertEnts.branches);
      }

      if (insertEnts.bridges.length > 0) {
        await tx.insert(bridgesTable).values(insertEnts.bridges);
      }

      if (insertEnts.connections.length > 0) {
        await tx.insert(connectionsTable).values(insertEnts.connections);
      }

      if (insertEnts.dashboards.length > 0) {
        await tx.insert(dashboardsTable).values(insertEnts.dashboards);
      }

      if (insertEnts.envs.length > 0) {
        await tx.insert(envsTable).values(insertEnts.envs);
      }

      if (insertEnts.kits.length > 0) {
        await tx.insert(kitsTable).values(insertEnts.kits);
      }

      if (insertEnts.mconfigs.length > 0) {
        await tx.insert(mconfigsTable).values(insertEnts.mconfigs);
      }

      if (insertEnts.members.length > 0) {
        await tx.insert(membersTable).values(insertEnts.members);
      }

      if (insertEnts.models.length > 0) {
        await tx.insert(modelsTable).values(insertEnts.models);
      }

      if (insertEnts.notes.length > 0) {
        await tx.insert(notesTable).values(insertEnts.notes);
      }

      if (insertEnts.orgs.length > 0) {
        await tx.insert(orgsTable).values(insertEnts.orgs);
      }

      if (insertEnts.projects.length > 0) {
        await tx.insert(projectsTable).values(insertEnts.projects);
      }

      if (insertEnts.queries.length > 0) {
        await tx.insert(queriesTable).values(insertEnts.queries);
      }

      if (insertEnts.reports.length > 0) {
        await tx.insert(reportsTable).values(insertEnts.reports);
      }

      if (insertEnts.structs.length > 0) {
        await tx.insert(structsTable).values(insertEnts.structs);
      }

      if (insertEnts.users.length > 0) {
        await tx.insert(usersTable).values(insertEnts.users);
      }

      if (insertEnts.charts.length > 0) {
        await tx.insert(chartsTable).values(insertEnts.charts);
      }
    }

    //
    //
    //

    if (isDefined(updateEnts)) {
      if (updateEnts.avatars.length > 0) {
        updateEnts.avatars = setUndefinedToNull({
          ents: updateEnts.avatars,
          table: avatarsTable
        });

        await forEachSeries(updateEnts.avatars, async x => {
          await tx
            .update(avatarsTable)
            .set(x)
            .where(eq(avatarsTable.userId, x.userId));
        });
      }

      if (updateEnts.branches.length > 0) {
        updateEnts.branches = setUndefinedToNull({
          ents: updateEnts.branches,
          table: branchesTable
        });

        await forEachSeries(updateEnts.branches, async x => {
          await tx
            .update(branchesTable)
            .set(x)
            .where(eq(branchesTable.branchFullId, x.branchFullId));
        });
      }

      if (updateEnts.bridges.length > 0) {
        updateEnts.bridges = setUndefinedToNull({
          ents: updateEnts.bridges,
          table: bridgesTable
        });

        await forEachSeries(updateEnts.bridges, async x => {
          await tx
            .update(bridgesTable)
            .set(x)
            .where(eq(bridgesTable.bridgeFullId, x.bridgeFullId));
        });
      }

      if (updateEnts.connections.length > 0) {
        updateEnts.connections = setUndefinedToNull({
          ents: updateEnts.connections,
          table: connectionsTable
        });

        await forEachSeries(updateEnts.connections, async x => {
          await tx
            .update(connectionsTable)
            .set(x)
            .where(eq(connectionsTable.connectionFullId, x.connectionFullId));
        });
      }

      if (updateEnts.dashboards.length > 0) {
        updateEnts.dashboards = setUndefinedToNull({
          ents: updateEnts.dashboards,
          table: dashboardsTable
        });

        await forEachSeries(updateEnts.dashboards, async x => {
          await tx
            .update(dashboardsTable)
            .set(x)
            .where(eq(dashboardsTable.dashboardFullId, x.dashboardFullId));
        });
      }

      if (updateEnts.envs.length > 0) {
        updateEnts.envs = setUndefinedToNull({
          ents: updateEnts.envs,
          table: envsTable
        });

        await forEachSeries(updateEnts.envs, async x => {
          await tx
            .update(envsTable)
            .set(x)
            .where(eq(envsTable.envFullId, x.envFullId));
        });
      }

      if (updateEnts.kits.length > 0) {
        updateEnts.kits = setUndefinedToNull({
          ents: updateEnts.kits,
          table: kitsTable
        });

        await forEachSeries(updateEnts.kits, async x => {
          await tx.update(kitsTable).set(x).where(eq(kitsTable.kitId, x.kitId));
        });
      }

      if (updateEnts.mconfigs.length > 0) {
        updateEnts.mconfigs = setUndefinedToNull({
          ents: updateEnts.mconfigs,
          table: mconfigsTable
        });

        await forEachSeries(updateEnts.mconfigs, async x => {
          await tx
            .update(mconfigsTable)
            .set(x)
            .where(eq(mconfigsTable.mconfigId, x.mconfigId));
        });
      }

      if (updateEnts.members.length > 0) {
        updateEnts.members = setUndefinedToNull({
          ents: updateEnts.members,
          table: membersTable
        });

        await forEachSeries(updateEnts.members, async x => {
          await tx
            .update(membersTable)
            .set(x)
            .where(eq(membersTable.memberFullId, x.memberFullId));
        });
      }

      if (updateEnts.models.length > 0) {
        updateEnts.models = setUndefinedToNull({
          ents: updateEnts.models,
          table: modelsTable
        });

        await forEachSeries(updateEnts.models, async x => {
          await tx
            .update(modelsTable)
            .set(x)
            .where(eq(modelsTable.modelFullId, x.modelFullId));
        });
      }

      if (updateEnts.notes.length > 0) {
        updateEnts.notes = setUndefinedToNull({
          ents: updateEnts.notes,
          table: notesTable
        });

        await forEachSeries(updateEnts.notes, async x => {
          await tx
            .update(notesTable)
            .set(x)
            .where(eq(notesTable.noteId, x.noteId));
        });
      }

      if (updateEnts.orgs.length > 0) {
        updateEnts.orgs = setUndefinedToNull({
          ents: updateEnts.orgs,
          table: orgsTable
        });

        await forEachSeries(updateEnts.orgs, async x => {
          await tx.update(orgsTable).set(x).where(eq(orgsTable.orgId, x.orgId));
        });
      }

      if (updateEnts.projects.length > 0) {
        updateEnts.projects = setUndefinedToNull({
          ents: updateEnts.projects,
          table: projectsTable
        });

        await forEachSeries(updateEnts.projects, async x => {
          await tx
            .update(projectsTable)
            .set(x)
            .where(eq(projectsTable.projectId, x.projectId));
        });
      }

      if (updateEnts.queries.length > 0) {
        updateEnts.queries = setUndefinedToNull({
          ents: updateEnts.queries,
          table: queriesTable
        });

        await forEachSeries(updateEnts.queries, async x => {
          await tx
            .update(queriesTable)
            .set(x)
            .where(eq(queriesTable.queryId, x.queryId));
        });
      }

      if (updateEnts.reports.length > 0) {
        updateEnts.reports = setUndefinedToNull({
          ents: updateEnts.reports,
          table: reportsTable
        });

        await forEachSeries(updateEnts.reports, async x => {
          await tx
            .update(reportsTable)
            .set(x)
            .where(eq(reportsTable.reportFullId, x.reportFullId));
        });
      }

      if (updateEnts.structs.length > 0) {
        updateEnts.structs = setUndefinedToNull({
          ents: updateEnts.structs,
          table: structsTable
        });

        await forEachSeries(updateEnts.structs, async x => {
          await tx
            .update(structsTable)
            .set(x)
            .where(eq(structsTable.structId, x.structId));
        });
      }

      if (updateEnts.users.length > 0) {
        updateEnts.users = setUndefinedToNull({
          ents: updateEnts.users,
          table: usersTable
        });

        await forEachSeries(updateEnts.users, async x => {
          await tx
            .update(usersTable)
            .set(x)
            .where(eq(usersTable.userId, x.userId));
        });
      }

      if (updateEnts.charts.length > 0) {
        updateEnts.charts = setUndefinedToNull({
          ents: updateEnts.charts,
          table: chartsTable
        });

        await forEachSeries(updateEnts.charts, async x => {
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

    if (isDefined(insOrUpdEnts)) {
      if (insOrUpdEnts.avatars.length > 0) {
        insOrUpdEnts.avatars = Array.from(
          new Set(insOrUpdEnts.avatars.map(x => x.userId))
        ).map(id => insOrUpdEnts.avatars.find(x => x.userId === id));

        insOrUpdEnts.avatars = setUndefinedToNull({
          ents: insOrUpdEnts.avatars,
          table: avatarsTable
        });

        await tx
          .insert(avatarsTable)
          .values(insOrUpdEnts.avatars)
          .onConflictDoUpdate({
            target: avatarsTable.userId,
            set: drizzleSetAllColumnsFull({ table: avatarsTable })
          });
      }

      if (insOrUpdEnts.branches.length > 0) {
        insOrUpdEnts.branches = Array.from(
          new Set(insOrUpdEnts.branches.map(x => x.branchFullId))
        ).map(id => insOrUpdEnts.branches.find(x => x.branchFullId === id));

        insOrUpdEnts.branches = setUndefinedToNull({
          ents: insOrUpdEnts.branches,
          table: branchesTable
        });

        await tx
          .insert(branchesTable)
          .values(insOrUpdEnts.branches)
          .onConflictDoUpdate({
            target: branchesTable.branchFullId,
            set: drizzleSetAllColumnsFull({ table: branchesTable })
          });
      }

      if (insOrUpdEnts.bridges.length > 0) {
        insOrUpdEnts.bridges = Array.from(
          new Set(insOrUpdEnts.bridges.map(x => x.bridgeFullId))
        ).map(id => insOrUpdEnts.bridges.find(x => x.bridgeFullId === id));

        insOrUpdEnts.bridges = setUndefinedToNull({
          ents: insOrUpdEnts.bridges,
          table: bridgesTable
        });

        await tx
          .insert(bridgesTable)
          .values(insOrUpdEnts.bridges)
          .onConflictDoUpdate({
            target: bridgesTable.bridgeFullId,
            set: drizzleSetAllColumnsFull({ table: bridgesTable })
          });
      }

      if (insOrUpdEnts.connections.length > 0) {
        insOrUpdEnts.connections = Array.from(
          new Set(insOrUpdEnts.connections.map(x => x.connectionFullId))
        ).map(id =>
          insOrUpdEnts.connections.find(x => x.connectionFullId === id)
        );

        insOrUpdEnts.connections = setUndefinedToNull({
          ents: insOrUpdEnts.connections,
          table: connectionsTable
        });

        await tx
          .insert(connectionsTable)
          .values(insOrUpdEnts.connections)
          .onConflictDoUpdate({
            target: connectionsTable.connectionFullId,
            set: drizzleSetAllColumnsFull({ table: connectionsTable })
          });
      }

      if (insOrUpdEnts.dashboards.length > 0) {
        insOrUpdEnts.dashboards = Array.from(
          new Set(insOrUpdEnts.dashboards.map(x => x.dashboardFullId))
        ).map(id =>
          insOrUpdEnts.dashboards.find(x => x.dashboardFullId === id)
        );

        insOrUpdEnts.dashboards = setUndefinedToNull({
          ents: insOrUpdEnts.dashboards,
          table: dashboardsTable
        });

        await tx
          .insert(dashboardsTable)
          .values(insOrUpdEnts.dashboards)
          .onConflictDoUpdate({
            target: dashboardsTable.dashboardFullId,
            set: drizzleSetAllColumnsFull({ table: dashboardsTable })
          });
      }

      if (insOrUpdEnts.envs.length > 0) {
        insOrUpdEnts.envs = Array.from(
          new Set(insOrUpdEnts.envs.map(x => x.envFullId))
        ).map(id => insOrUpdEnts.envs.find(x => x.envFullId === id));

        insOrUpdEnts.envs = setUndefinedToNull({
          ents: insOrUpdEnts.envs,
          table: envsTable
        });

        await tx
          .insert(envsTable)
          .values(insOrUpdEnts.envs)
          .onConflictDoUpdate({
            target: envsTable.envFullId,
            set: drizzleSetAllColumnsFull({ table: envsTable })
          });
      }

      if (insOrUpdEnts.kits.length > 0) {
        insOrUpdEnts.kits = Array.from(
          new Set(insOrUpdEnts.kits.map(x => x.kitId))
        ).map(id => insOrUpdEnts.kits.find(x => x.kitId === id));

        insOrUpdEnts.kits = setUndefinedToNull({
          ents: insOrUpdEnts.kits,
          table: kitsTable
        });

        await tx
          .insert(kitsTable)
          .values(insOrUpdEnts.kits)
          .onConflictDoUpdate({
            target: kitsTable.kitId,
            set: drizzleSetAllColumnsFull({ table: kitsTable })
          });
      }

      if (insOrUpdEnts.mconfigs.length > 0) {
        insOrUpdEnts.mconfigs = Array.from(
          new Set(insOrUpdEnts.mconfigs.map(x => x.mconfigId))
        ).map(id => insOrUpdEnts.mconfigs.find(x => x.mconfigId === id));

        insOrUpdEnts.mconfigs = setUndefinedToNull({
          ents: insOrUpdEnts.mconfigs,
          table: mconfigsTable
        });

        await tx
          .insert(mconfigsTable)
          .values(insOrUpdEnts.mconfigs)
          .onConflictDoUpdate({
            target: mconfigsTable.mconfigId,
            set: drizzleSetAllColumnsFull({ table: mconfigsTable })
          });
      }

      if (insOrUpdEnts.members.length > 0) {
        insOrUpdEnts.members = Array.from(
          new Set(insOrUpdEnts.members.map(x => x.memberFullId))
        ).map(id => insOrUpdEnts.members.find(x => x.memberFullId === id));

        insOrUpdEnts.members = setUndefinedToNull({
          ents: insOrUpdEnts.members,
          table: membersTable
        });

        await tx
          .insert(membersTable)
          .values(insOrUpdEnts.members)
          .onConflictDoUpdate({
            target: membersTable.memberFullId,
            set: drizzleSetAllColumnsFull({ table: membersTable })
          });
      }

      if (insOrUpdEnts.models.length > 0) {
        insOrUpdEnts.models = Array.from(
          new Set(insOrUpdEnts.models.map(x => x.modelFullId))
        ).map(id => insOrUpdEnts.models.find(x => x.modelFullId === id));

        insOrUpdEnts.models = setUndefinedToNull({
          ents: insOrUpdEnts.models,
          table: modelsTable
        });

        await tx
          .insert(modelsTable)
          .values(insOrUpdEnts.models)
          .onConflictDoUpdate({
            target: modelsTable.modelFullId,
            set: drizzleSetAllColumnsFull({ table: modelsTable })
          });
      }

      if (insOrUpdEnts.notes.length > 0) {
        insOrUpdEnts.notes = Array.from(
          new Set(insOrUpdEnts.notes.map(x => x.noteId))
        ).map(id => insOrUpdEnts.notes.find(x => x.noteId === id));

        insOrUpdEnts.notes = setUndefinedToNull({
          ents: insOrUpdEnts.notes,
          table: notesTable
        });

        await tx
          .insert(notesTable)
          .values(insOrUpdEnts.notes)
          .onConflictDoUpdate({
            target: notesTable.noteId,
            set: drizzleSetAllColumnsFull({ table: notesTable })
          });
      }

      if (insOrUpdEnts.orgs.length > 0) {
        insOrUpdEnts.orgs = Array.from(
          new Set(insOrUpdEnts.orgs.map(x => x.orgId))
        ).map(id => insOrUpdEnts.orgs.find(x => x.orgId === id));

        insOrUpdEnts.orgs = setUndefinedToNull({
          ents: insOrUpdEnts.orgs,
          table: orgsTable
        });

        await tx
          .insert(orgsTable)
          .values(insOrUpdEnts.orgs)
          .onConflictDoUpdate({
            target: orgsTable.orgId,
            set: drizzleSetAllColumnsFull({ table: orgsTable })
          });
      }

      if (insOrUpdEnts.projects.length > 0) {
        insOrUpdEnts.projects = Array.from(
          new Set(insOrUpdEnts.projects.map(x => x.projectId))
        ).map(id => insOrUpdEnts.projects.find(x => x.projectId === id));

        insOrUpdEnts.projects = setUndefinedToNull({
          ents: insOrUpdEnts.projects,
          table: projectsTable
        });

        await tx
          .insert(projectsTable)
          .values(insOrUpdEnts.projects)
          .onConflictDoUpdate({
            target: projectsTable.projectId,
            set: drizzleSetAllColumnsFull({ table: projectsTable })
          });
      }

      if (insOrUpdEnts.queries.length > 0) {
        insOrUpdEnts.queries = Array.from(
          new Set(insOrUpdEnts.queries.map(x => x.queryId))
        ).map(id => insOrUpdEnts.queries.find(x => x.queryId === id));

        insOrUpdEnts.queries = setUndefinedToNull({
          ents: insOrUpdEnts.queries,
          table: queriesTable
        });

        await tx
          .insert(queriesTable)
          .values(insOrUpdEnts.queries)
          .onConflictDoUpdate({
            target: queriesTable.queryId,
            set: drizzleSetAllColumnsFull({ table: queriesTable })
          });
      }

      if (insOrUpdEnts.reports.length > 0) {
        insOrUpdEnts.reports = Array.from(
          new Set(insOrUpdEnts.reports.map(x => x.reportFullId))
        ).map(id => insOrUpdEnts.reports.find(x => x.reportFullId === id));

        insOrUpdEnts.reports = setUndefinedToNull({
          ents: insOrUpdEnts.reports,
          table: reportsTable
        });

        await tx
          .insert(reportsTable)
          .values(insOrUpdEnts.reports)
          .onConflictDoUpdate({
            target: reportsTable.reportFullId,
            set: drizzleSetAllColumnsFull({ table: reportsTable })
          });
      }

      if (insOrUpdEnts.structs.length > 0) {
        insOrUpdEnts.structs = Array.from(
          new Set(insOrUpdEnts.structs.map(x => x.structId))
        ).map(id => insOrUpdEnts.structs.find(x => x.structId === id));

        insOrUpdEnts.structs = setUndefinedToNull({
          ents: insOrUpdEnts.structs,
          table: structsTable
        });

        await tx
          .insert(structsTable)
          .values(insOrUpdEnts.structs)
          .onConflictDoUpdate({
            target: structsTable.structId,
            set: drizzleSetAllColumnsFull({ table: structsTable })
          });
      }

      if (insOrUpdEnts.users.length > 0) {
        insOrUpdEnts.users = Array.from(
          new Set(insOrUpdEnts.users.map(x => x.userId))
        ).map(id => insOrUpdEnts.users.find(x => x.userId === id));

        insOrUpdEnts.users = setUndefinedToNull({
          ents: insOrUpdEnts.users,
          table: usersTable
        });

        await tx
          .insert(usersTable)
          .values(insOrUpdEnts.users)
          .onConflictDoUpdate({
            target: usersTable.userId,
            set: drizzleSetAllColumnsFull({ table: usersTable })
          });
      }

      if (insOrUpdEnts.charts.length > 0) {
        insOrUpdEnts.charts = Array.from(
          new Set(insOrUpdEnts.charts.map(x => x.chartFullId))
        ).map(id => insOrUpdEnts.charts.find(x => x.chartFullId === id));

        insOrUpdEnts.charts = setUndefinedToNull({
          ents: insOrUpdEnts.charts,
          table: chartsTable
        });

        await tx
          .insert(chartsTable)
          .values(insOrUpdEnts.charts)
          .onConflictDoUpdate({
            target: chartsTable.chartFullId,
            set: drizzleSetAllColumnsFull({ table: chartsTable })
          });
      }
    }

    //
    //
    //

    if (isDefined(insOrDoNothingEnts)) {
      if (insOrDoNothingEnts.queries.length > 0) {
        insOrDoNothingEnts.queries = Array.from(
          new Set(insOrDoNothingEnts.queries.map(x => x.queryId))
        ).map(id => insOrDoNothingEnts.queries.find(x => x.queryId === id));

        insOrDoNothingEnts.queries = setUndefinedToNull({
          ents: insOrDoNothingEnts.queries,
          table: queriesTable
        });

        await tx
          .insert(queriesTable)
          .values(insOrDoNothingEnts.queries)
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

    let pack: PackerOutput = {
      insert: item.insert,
      update: item.update,
      insertOrUpdate: item.insertOrUpdate,
      insertOrDoNothing: item.insertOrDoNothing
    };

    return pack;
  }
}
