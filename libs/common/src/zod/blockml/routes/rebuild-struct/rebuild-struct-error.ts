import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBlockmlRebuildStructError = never;

export let zToBlockmlRebuildStructError = z.never();

assertTypesEqual<
  ToBlockmlRebuildStructError,
  z.infer<typeof zToBlockmlRebuildStructError>
>({ value: true });
