import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskGetCatalogNodesError,
  zToDiskGetCatalogNodesError
} from './get-catalog-nodes-error';
import {
  type ToDiskGetCatalogNodesOutput,
  zToDiskGetCatalogNodesOutput
} from './get-catalog-nodes-output';

export type ToDiskGetCatalogNodesResponse = ToDiskResponseBase<
  'getCatalogNodes',
  ToDiskGetCatalogNodesOutput,
  ToDiskGetCatalogNodesError
>;

export let zToDiskGetCatalogNodesResponse = makeToDiskResponseSchema({
  operation: 'getCatalogNodes',
  output: zToDiskGetCatalogNodesOutput,
  error: zToDiskGetCatalogNodesError
});

assertTypesEqual<
  ToDiskGetCatalogNodesResponse,
  z.infer<typeof zToDiskGetCatalogNodesResponse>
>({ value: true });
