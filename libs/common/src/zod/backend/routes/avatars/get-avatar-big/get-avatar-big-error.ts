import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetAvatarBigError = never;

export let zToBackendGetAvatarBigError = z.never();

assertTypesEqual<
  ToBackendGetAvatarBigError,
  z.infer<typeof zToBackendGetAvatarBigError>
>({ value: true });
