import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskGetCatalogNodesError,
  zToDiskGetCatalogNodesError
} from './get-catalog-nodes-error';

export type ToDiskGetCatalogNodesResponse = ToDiskResponseBase<
  'getCatalogNodes',
  ToDiskGetCatalogNodesOutput,
  ToDiskGetCatalogNodesError
>;

export type ToDiskGetCatalogNodesOutput = {
  repo: Repo;
};

export let zToDiskGetCatalogNodesOutput = z
  .object({ repo: zRepo })
  .meta({ id: 'ToDiskGetCatalogNodesOutput' });

export let zToDiskGetCatalogNodesResponse = makeToDiskResponseSchema({
  operation: 'getCatalogNodes',
  output: zToDiskGetCatalogNodesOutput,
  error: zToDiskGetCatalogNodesError
});

assertTypesEqual<
  ToDiskGetCatalogNodesOutput,
  z.infer<typeof zToDiskGetCatalogNodesOutput>
>({ value: true });

assertTypesEqual<
  ToDiskGetCatalogNodesResponse,
  z.infer<typeof zToDiskGetCatalogNodesResponse>
>({ value: true });
