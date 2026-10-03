import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FilterBricksDictionary = Record<string, string[]>;

export let zFilterBricksDictionary = z
  .record(z.string(), z.array(z.string()))
  .meta({ id: 'FilterBricksDictionary' });

assertTypesEqual<
  FilterBricksDictionary,
  z.infer<typeof zFilterBricksDictionary>
>({ value: true });
