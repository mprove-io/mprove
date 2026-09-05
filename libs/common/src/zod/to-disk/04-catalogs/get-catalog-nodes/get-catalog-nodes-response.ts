import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskGetCatalogNodesResponseInfo,
  zToDiskGetCatalogNodesResponseInfo
} from './get-catalog-nodes-response-info';
import {
  type ToDiskGetCatalogNodesResponsePayload,
  zToDiskGetCatalogNodesResponsePayload
} from './get-catalog-nodes-response-payload';

export type ToDiskGetCatalogNodesResponse = Extend<
  MyResponse,
  {
    info: ToDiskGetCatalogNodesResponseInfo;
    payload: ToDiskGetCatalogNodesResponsePayload;
  }
>;

export let zToDiskGetCatalogNodesResponse = zMyResponse
  .extend({
    info: zToDiskGetCatalogNodesResponseInfo,
    payload: zToDiskGetCatalogNodesResponsePayload
  })
  .meta({ id: 'ToDiskGetCatalogNodesResponse' });

assertTypesEqual<
  ToDiskGetCatalogNodesResponse,
  z.infer<typeof zToDiskGetCatalogNodesResponse>
>({ value: true });
