import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskRenameCatalogNodeResponseInfo,
  zToDiskRenameCatalogNodeResponseInfo
} from './rename-catalog-node-response-info';
import {
  type ToDiskRenameCatalogNodeResponsePayload,
  zToDiskRenameCatalogNodeResponsePayload
} from './rename-catalog-node-response-payload';

export type ToDiskRenameCatalogNodeResponse = Extend<
  MyResponse,
  {
    info: ToDiskRenameCatalogNodeResponseInfo;
    payload: ToDiskRenameCatalogNodeResponsePayload;
  }
>;

export let zToDiskRenameCatalogNodeResponse = zMyResponse
  .extend({
    info: zToDiskRenameCatalogNodeResponseInfo,
    payload: zToDiskRenameCatalogNodeResponsePayload
  })
  .meta({ id: 'ToDiskRenameCatalogNodeResponse' });

assertTypesEqual<
  ToDiskRenameCatalogNodeResponse,
  z.infer<typeof zToDiskRenameCatalogNodeResponse>
>({ value: true });
