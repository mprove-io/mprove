import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetFavoriteOutput = Record<string, never>;

export let zToBackendSetFavoriteOutput = z
  .object({})
  .meta({ id: 'ToBackendSetFavoriteOutput' });

assertTypesEqual<
  ToBackendSetFavoriteOutput,
  z.infer<typeof zToBackendSetFavoriteOutput>
>({ value: true });
