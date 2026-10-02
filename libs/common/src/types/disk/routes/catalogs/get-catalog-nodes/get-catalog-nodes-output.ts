import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/types/disk/parts/repo';

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
