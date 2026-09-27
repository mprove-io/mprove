import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskGetCatalogNodesOutput = {
  repo: Repo;
};

export let zToDiskGetCatalogNodesOutput = z
  .object({ repo: zRepo })
  .meta({ id: 'ToDiskGetCatalogNodesOutput' });

assertTypesEqual<
  ToDiskGetCatalogNodesOutput,
  z.infer<typeof zToDiskGetCatalogNodesOutput>
>({ value: true });
