import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendMoveCatalogNodeError,
  zToBackendMoveCatalogNodeError
} from './move-catalog-node-error';

export type ToBackendMoveCatalogNodeOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendMoveCatalogNodeResponse = ToBackendResponse<
  ToBackendMoveCatalogNodeOutput,
  ToBackendMoveCatalogNodeError
>;

export let zToBackendMoveCatalogNodeOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendMoveCatalogNodeOutput' });

export let zToBackendMoveCatalogNodeResponse = makeToBackendResponseSchema({
  success: zToBackendMoveCatalogNodeOutput,
  error: zToBackendMoveCatalogNodeError
}).meta({ id: 'ToBackendMoveCatalogNodeResponse' });

assertTypesEqual<
  ToBackendMoveCatalogNodeOutput,
  z.infer<typeof zToBackendMoveCatalogNodeOutput>
>({ value: true });

assertTypesEqual<
  ToBackendMoveCatalogNodeResponse,
  z.infer<typeof zToBackendMoveCatalogNodeResponse>
>({ value: true });
