import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskMoveCatalogNodeResponseInfo,
  zToDiskMoveCatalogNodeResponseInfo
} from './move-catalog-node-response-info';
import {
  type ToDiskMoveCatalogNodeResponsePayload,
  zToDiskMoveCatalogNodeResponsePayload
} from './move-catalog-node-response-payload';

export type ToDiskMoveCatalogNodeResponse = Extend<
  MyResponse,
  {
    info: ToDiskMoveCatalogNodeResponseInfo;
    payload: ToDiskMoveCatalogNodeResponsePayload;
  }
>;

export let zToDiskMoveCatalogNodeResponse = zMyResponse
  .extend({
    info: zToDiskMoveCatalogNodeResponseInfo,
    payload: zToDiskMoveCatalogNodeResponsePayload
  })
  .meta({ id: 'ToDiskMoveCatalogNodeResponse' });

assertTypesEqual<
  ToDiskMoveCatalogNodeResponse,
  z.infer<typeof zToDiskMoveCatalogNodeResponse>
>({ value: true });
