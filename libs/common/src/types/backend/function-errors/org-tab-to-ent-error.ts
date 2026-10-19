import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type OrgTabToEntError = MakeHashError;

export let zOrgTabToEntError = zMakeHashError;

assertTypesEqual<OrgTabToEntError, z.infer<typeof zOrgTabToEntError>>({
  value: true
});
