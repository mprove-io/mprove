import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CombinedSchemaItem,
  zCombinedSchemaItem
} from '#common/types/backend/connection-schemas/combined-schema';
import { type Member, zMember } from '#common/types/backend/member';

export type ToBackendGetConnectionSchemasOutput = {
  userMember: Member;
  combinedSchemaItems: CombinedSchemaItem[];
};

export let zToBackendGetConnectionSchemasOutput = z
  .object({
    userMember: zMember,
    combinedSchemaItems: z.array(zCombinedSchemaItem)
  })
  .meta({ id: 'ToBackendGetConnectionSchemasOutput' });

assertTypesEqual<
  ToBackendGetConnectionSchemasOutput,
  z.infer<typeof zToBackendGetConnectionSchemasOutput>
>({ value: true });
