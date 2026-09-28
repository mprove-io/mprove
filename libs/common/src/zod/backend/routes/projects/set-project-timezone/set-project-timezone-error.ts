import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectTimezoneError = never;

export let zToBackendSetProjectTimezoneError = z.never();

assertTypesEqual<
  ToBackendSetProjectTimezoneError,
  z.infer<typeof zToBackendSetProjectTimezoneError>
>({ value: true });
