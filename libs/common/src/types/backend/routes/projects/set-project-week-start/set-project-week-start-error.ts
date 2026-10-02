import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectWeekStartError = never;

export let zToBackendSetProjectWeekStartError = z.never();

assertTypesEqual<
  ToBackendSetProjectWeekStartError,
  z.infer<typeof zToBackendSetProjectWeekStartError>
>({ value: true });
