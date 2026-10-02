import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskRenameCatalogNodeError,
  zToDiskRenameCatalogNodeError
} from './rename-catalog-node-error';
import {
  type ToDiskRenameCatalogNodeOutput,
  zToDiskRenameCatalogNodeOutput
} from './rename-catalog-node-output';

export type ToDiskRenameCatalogNodeResponse = ToDiskResponseBase<
  'renameCatalogNode',
  ToDiskRenameCatalogNodeOutput,
  ToDiskRenameCatalogNodeError
>;

export let zToDiskRenameCatalogNodeResponse = makeToDiskResponseSchema({
  operation: 'renameCatalogNode',
  output: zToDiskRenameCatalogNodeOutput,
  error: zToDiskRenameCatalogNodeError
});

assertTypesEqual<
  ToDiskRenameCatalogNodeResponse,
  z.infer<typeof zToDiskRenameCatalogNodeResponse>
>({ value: true });
