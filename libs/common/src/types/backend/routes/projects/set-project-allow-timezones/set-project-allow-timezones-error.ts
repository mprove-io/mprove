import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectAllowTimezonesError = never;

export let zToBackendSetProjectAllowTimezonesError = z.never();

assertTypesEqual<
  ToBackendSetProjectAllowTimezonesError,
  z.infer<typeof zToBackendSetProjectAllowTimezonesError>
>({ value: true });
