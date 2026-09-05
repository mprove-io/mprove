import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskGetCatalogNodesRequestInfo,
  zToDiskGetCatalogNodesRequestInfo
} from './get-catalog-nodes-request-info';
import {
  type ToDiskGetCatalogNodesRequestPayload,
  zToDiskGetCatalogNodesRequestPayload
} from './get-catalog-nodes-request-payload';

export type ToDiskGetCatalogNodesRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskGetCatalogNodesRequestInfo;
    payload: ToDiskGetCatalogNodesRequestPayload;
  }
>;

export let zToDiskGetCatalogNodesRequest = zToDiskRequest
  .extend({
    info: zToDiskGetCatalogNodesRequestInfo,
    payload: zToDiskGetCatalogNodesRequestPayload
  })
  .meta({ id: 'ToDiskGetCatalogNodesRequest' });

assertTypesEqual<
  ToDiskGetCatalogNodesRequest,
  z.infer<typeof zToDiskGetCatalogNodesRequest>
>({ value: true });
