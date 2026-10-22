import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';

export type WriteOutput = {
  insert?: DbTabsPack;
  update?: DbTabsPack;
  insertOrUpdate?: DbTabsPack;
  insertOrDoNothing?: DbTabsPack;
};
