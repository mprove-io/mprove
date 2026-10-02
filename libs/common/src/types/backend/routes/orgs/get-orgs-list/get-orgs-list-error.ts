import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetOrgsListError = never;

export let zToBackendGetOrgsListError = z.never();

assertTypesEqual<
  ToBackendGetOrgsListError,
  z.infer<typeof zToBackendGetOrgsListError>
>({ value: true });
