import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskGetCatalogFilesResponseInfo,
  zToDiskGetCatalogFilesResponseInfo
} from './get-catalog-files-response-info';
import {
  type ToDiskGetCatalogFilesResponsePayload,
  zToDiskGetCatalogFilesResponsePayload
} from './get-catalog-files-response-payload';

export type ToDiskGetCatalogFilesResponse = Extend<
  MyResponse,
  {
    info: ToDiskGetCatalogFilesResponseInfo;
    payload: ToDiskGetCatalogFilesResponsePayload;
  }
>;

export let zToDiskGetCatalogFilesResponse = zMyResponse
  .extend({
    info: zToDiskGetCatalogFilesResponseInfo,
    payload: zToDiskGetCatalogFilesResponsePayload
  })
  .meta({ id: 'ToDiskGetCatalogFilesResponse' });

assertTypesEqual<
  ToDiskGetCatalogFilesResponse,
  z.infer<typeof zToDiskGetCatalogFilesResponse>
>({ value: true });
