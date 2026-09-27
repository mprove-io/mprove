import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type StructX, zStructX } from '#common/zod/backend/struct-x';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendRenameCatalogNodeError,
  zToBackendRenameCatalogNodeError
} from './rename-catalog-node-error';

export type ToBackendRenameCatalogNodeOutput = {
  repo: Repo;
  struct: StructX;
  needValidate: boolean;
};

export type ToBackendRenameCatalogNodeResponse = ToBackendResponse<
  ToBackendRenameCatalogNodeOutput,
  ToBackendRenameCatalogNodeError
>;

export let zToBackendRenameCatalogNodeOutput = z
  .object({
    repo: zRepo,
    struct: zStructX,
    needValidate: z.boolean()
  })
  .meta({ id: 'ToBackendRenameCatalogNodeOutput' });

export let zToBackendRenameCatalogNodeResponse = makeToBackendResponseSchema({
  success: zToBackendRenameCatalogNodeOutput,
  error: zToBackendRenameCatalogNodeError
}).meta({ id: 'ToBackendRenameCatalogNodeResponse' });

assertTypesEqual<
  ToBackendRenameCatalogNodeOutput,
  z.infer<typeof zToBackendRenameCatalogNodeOutput>
>({ value: true });

assertTypesEqual<
  ToBackendRenameCatalogNodeResponse,
  z.infer<typeof zToBackendRenameCatalogNodeResponse>
>({ value: true });
