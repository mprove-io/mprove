import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskCatalogNode,
  zDiskCatalogNode
} from '#common/types/disk/disk-catalog-node';
import { type Repo, zRepo } from '#common/types/disk/repo';
import type { Extend } from '#common/types/extend';

export type ToBackendSyncRepoRepo = Extend<
  Omit<Repo, 'nodes' | 'changesToCommit' | 'changesToPush'>,
  {
    nodes?: DiskCatalogNode[];
  }
>;

export let zToBackendSyncRepoRepo = zRepo
  .omit({ nodes: true, changesToCommit: true, changesToPush: true })
  .extend({
    nodes: z.array(zDiskCatalogNode).nullish()
  })
  .meta({ id: 'ToBackendSyncRepoRepo' });

assertTypesEqual<ToBackendSyncRepoRepo, z.infer<typeof zToBackendSyncRepoRepo>>(
  { value: true }
);
