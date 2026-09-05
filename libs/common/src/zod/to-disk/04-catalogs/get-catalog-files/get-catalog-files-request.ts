import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskGetCatalogFilesRequestInfo,
  zToDiskGetCatalogFilesRequestInfo
} from './get-catalog-files-request-info';
import {
  type ToDiskGetCatalogFilesRequestPayload,
  zToDiskGetCatalogFilesRequestPayload
} from './get-catalog-files-request-payload';

export type ToDiskGetCatalogFilesRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskGetCatalogFilesRequestInfo;
    payload: ToDiskGetCatalogFilesRequestPayload;
  }
>;

export let zToDiskGetCatalogFilesRequest = zToDiskRequest
  .extend({
    info: zToDiskGetCatalogFilesRequestInfo,
    payload: zToDiskGetCatalogFilesRequestPayload
  })
  .meta({ id: 'ToDiskGetCatalogFilesRequest' });

assertTypesEqual<
  ToDiskGetCatalogFilesRequest,
  z.infer<typeof zToDiskGetCatalogFilesRequest>
>({ value: true });
