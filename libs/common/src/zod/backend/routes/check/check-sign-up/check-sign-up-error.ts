import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckSignUpError = never;

export let zToBackendCheckSignUpError = z.never();

assertTypesEqual<
  ToBackendCheckSignUpError,
  z.infer<typeof zToBackendCheckSignUpError>
>({ value: true });
