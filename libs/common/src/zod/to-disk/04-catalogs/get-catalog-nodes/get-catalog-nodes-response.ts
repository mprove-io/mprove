import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskGetCatalogNodesError,
  zToDiskGetCatalogNodesError
} from './get-catalog-nodes-error';

export type ToDiskGetCatalogNodesOutput = {
  repo: Repo;
};

export type ToDiskGetCatalogNodesResponse = ToDiskResponse<
  'ToDiskGetCatalogNodes',
  ToDiskGetCatalogNodesOutput,
  ToDiskGetCatalogNodesError
>;

export let zToDiskGetCatalogNodesResponse = makeToDiskResponseSchema({
  path: 'ToDiskGetCatalogNodes',
  success: z
    .object({ repo: zRepo })
    .meta({ id: 'ToDiskGetCatalogNodesOutput' }),
  error: zToDiskGetCatalogNodesError
});

assertTypesEqual<
  ToDiskGetCatalogNodesResponse,
  z.infer<typeof zToDiskGetCatalogNodesResponse>
>({ value: true });
