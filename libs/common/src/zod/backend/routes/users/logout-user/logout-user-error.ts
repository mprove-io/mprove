import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendLogoutUserError = never;

export let zToBackendLogoutUserError = z.never();

assertTypesEqual<
  ToBackendLogoutUserError,
  z.infer<typeof zToBackendLogoutUserError>
>({ value: true });
