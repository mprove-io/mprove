import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskMoveCatalogNodeError,
  zToDiskMoveCatalogNodeError
} from './move-catalog-node-error';
import {
  type ToDiskMoveCatalogNodeOutput,
  zToDiskMoveCatalogNodeOutput
} from './move-catalog-node-output';

export type ToDiskMoveCatalogNodeResponse = ToDiskResponseBase<
  'moveCatalogNode',
  ToDiskMoveCatalogNodeOutput,
  ToDiskMoveCatalogNodeError
>;

export let zToDiskMoveCatalogNodeResponse = makeToDiskResponseSchema({
  operation: 'moveCatalogNode',
  output: zToDiskMoveCatalogNodeOutput,
  error: zToDiskMoveCatalogNodeError
});

assertTypesEqual<
  ToDiskMoveCatalogNodeResponse,
  z.infer<typeof zToDiskMoveCatalogNodeResponse>
>({ value: true });
