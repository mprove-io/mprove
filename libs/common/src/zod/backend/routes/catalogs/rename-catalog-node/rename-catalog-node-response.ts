import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendRenameCatalogNodeOutput,
  zToBackendRenameCatalogNodeOutput
} from '#common/zod/backend/routes/catalogs/rename-catalog-node/rename-catalog-node-output';
import {
  type ToBackendRenameCatalogNodeError,
  zToBackendRenameCatalogNodeError
} from './rename-catalog-node-error';

export type ToBackendRenameCatalogNodeResponse = ToBackendResponseBase<
  'renameCatalogNode',
  ToBackendRenameCatalogNodeOutput,
  ToBackendRenameCatalogNodeError
>;

export let zToBackendRenameCatalogNodeResponse = makeToBackendResponseSchema({
  operation: 'renameCatalogNode',
  output: zToBackendRenameCatalogNodeOutput,
  error: zToBackendRenameCatalogNodeError
}).meta({ id: 'ToBackendRenameCatalogNodeResponse' });

assertTypesEqual<
  ToBackendRenameCatalogNodeResponse,
  z.infer<typeof zToBackendRenameCatalogNodeResponse>
>({ value: true });
