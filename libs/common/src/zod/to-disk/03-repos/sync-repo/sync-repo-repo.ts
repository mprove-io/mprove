import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import type { DiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import { zDiskCatalogNode } from '#common/zod/disk/disk-catalog-node';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskSyncRepoRepo = Extend<
  Omit<Repo, 'nodes' | 'changesToCommit' | 'changesToPush'>,
  {
    nodes?: DiskCatalogNode[];
  }
>;

export let zToDiskSyncRepoRepo = zRepo
  .omit({ nodes: true, changesToCommit: true, changesToPush: true })
  .extend({
    nodes: z.array(zDiskCatalogNode).nullish()
  })
  .meta({ id: 'ToDiskSyncRepoRepo' });

assertTypesEqual<ToDiskSyncRepoRepo, z.infer<typeof zToDiskSyncRepoRepo>>({
  value: true
});
