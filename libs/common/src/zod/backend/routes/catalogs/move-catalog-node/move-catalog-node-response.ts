import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendMoveCatalogNodeOutput,
  zToBackendMoveCatalogNodeOutput
} from '#common/zod/backend/routes/catalogs/move-catalog-node/move-catalog-node-output';
import {
  type ToBackendMoveCatalogNodeError,
  zToBackendMoveCatalogNodeError
} from './move-catalog-node-error';

export type ToBackendMoveCatalogNodeResponse = ToBackendResponseBase<
  'moveCatalogNode',
  ToBackendMoveCatalogNodeOutput,
  ToBackendMoveCatalogNodeError
>;

export let zToBackendMoveCatalogNodeResponse = makeToBackendResponseSchema({
  operation: 'moveCatalogNode',
  output: zToBackendMoveCatalogNodeOutput,
  error: zToBackendMoveCatalogNodeError
}).meta({ id: 'ToBackendMoveCatalogNodeResponse' });

assertTypesEqual<
  ToBackendMoveCatalogNodeResponse,
  z.infer<typeof zToBackendMoveCatalogNodeResponse>
>({ value: true });
