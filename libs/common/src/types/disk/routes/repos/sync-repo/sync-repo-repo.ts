import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { DiskCatalogNode } from '#common/types/disk/parts/disk-catalog-node';
import { zDiskCatalogNode } from '#common/types/disk/parts/disk-catalog-node';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';
import type { Extend } from '#common/types/extend';

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
