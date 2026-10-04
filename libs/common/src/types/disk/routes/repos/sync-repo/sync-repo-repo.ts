import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { DiskCatalogNode } from '#common/types/disk/parts/catalog/disk-catalog-node';
import { zDiskCatalogNode } from '#common/types/disk/parts/catalog/disk-catalog-node';
import { type Repo, zRepo } from '#common/types/disk/parts/repo/repo';
import type { Extend } from '#common/types/extend';
import type { RepoSyncScope } from '#common/types/shared/repo-sync-scope';

export type ToDiskSyncRepoRepo = Extend<
  Omit<Repo, RepoSyncScope>,
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
