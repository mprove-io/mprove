import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetUserProfileError = never;

export let zToBackendGetUserProfileError = z.never();

assertTypesEqual<
  ToBackendGetUserProfileError,
  z.infer<typeof zToBackendGetUserProfileError>
>({ value: true });
