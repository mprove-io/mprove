import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeHashError,
  zMakeHashError
} from '#common/types/backend/function-errors/make-hash-error';

export type MemberTabToEntError = MakeHashError;

export let zMemberTabToEntError = zMakeHashError;

assertTypesEqual<MemberTabToEntError, z.infer<typeof zMemberTabToEntError>>({
  value: true
});
