import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetProjectsListError = never;

export let zToBackendGetProjectsListError = z.never();

assertTypesEqual<
  ToBackendGetProjectsListError,
  z.infer<typeof zToBackendGetProjectsListError>
>({ value: true });
