import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CombinedSchemaItem,
  zCombinedSchemaItem
} from '#common/zod/backend/connection-schemas/combined-schema';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetConnectionSchemasError,
  zToBackendGetConnectionSchemasError
} from './get-connection-schemas-error';

export type ToBackendGetConnectionSchemasOutput = {
  userMember: Member;
  combinedSchemaItems: CombinedSchemaItem[];
};

export type ToBackendGetConnectionSchemasResponse = ToBackendResponse<
  ToBackendGetConnectionSchemasOutput,
  ToBackendGetConnectionSchemasError
>;

export let zToBackendGetConnectionSchemasOutput = z
  .object({
    userMember: zMember,
    combinedSchemaItems: z.array(zCombinedSchemaItem)
  })
  .meta({ id: 'ToBackendGetConnectionSchemasOutput' });

export let zToBackendGetConnectionSchemasResponse = makeToBackendResponseSchema(
  {
    success: zToBackendGetConnectionSchemasOutput,
    error: zToBackendGetConnectionSchemasError
  }
).meta({ id: 'ToBackendGetConnectionSchemasResponse' });

assertTypesEqual<
  ToBackendGetConnectionSchemasOutput,
  z.infer<typeof zToBackendGetConnectionSchemasOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionSchemasResponse,
  z.infer<typeof zToBackendGetConnectionSchemasResponse>
>({ value: true });
