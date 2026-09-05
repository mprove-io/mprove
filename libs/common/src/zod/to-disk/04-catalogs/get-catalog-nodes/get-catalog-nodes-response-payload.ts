import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';

export type ToDiskGetCatalogNodesResponsePayload = {
  repo: Repo;
};

export let zToDiskGetCatalogNodesResponsePayload = z
  .object({ repo: zRepo })
  .meta({ id: 'ToDiskGetCatalogNodesResponsePayload' });

assertTypesEqual<
  ToDiskGetCatalogNodesResponsePayload,
  z.infer<typeof zToDiskGetCatalogNodesResponsePayload>
>({ value: true });
