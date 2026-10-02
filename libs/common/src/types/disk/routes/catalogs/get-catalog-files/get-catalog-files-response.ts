import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskGetCatalogFilesError,
  zToDiskGetCatalogFilesError
} from './get-catalog-files-error';
import {
  type ToDiskGetCatalogFilesOutput,
  zToDiskGetCatalogFilesOutput
} from './get-catalog-files-output';

export type ToDiskGetCatalogFilesResponse = ToDiskResponseBase<
  'getCatalogFiles',
  ToDiskGetCatalogFilesOutput,
  ToDiskGetCatalogFilesError
>;

export let zToDiskGetCatalogFilesResponse = makeToDiskResponseSchema({
  operation: 'getCatalogFiles',
  output: zToDiskGetCatalogFilesOutput,
  error: zToDiskGetCatalogFilesError
});

assertTypesEqual<
  ToDiskGetCatalogFilesResponse,
  z.infer<typeof zToDiskGetCatalogFilesResponse>
>({ value: true });
