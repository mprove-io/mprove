import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SelectItem<T> = {
  value: T;
  label: string;
};

type SelectItemSchema<T extends z.ZodType> = z.ZodObject<{
  value: T;
  label: z.ZodString;
}>;

export let zfSelectItem = <T extends z.ZodType>(item: {
  zT: T;
}): SelectItemSchema<T> => {
  let { zT } = item;

  let schema: SelectItemSchema<T> = z
    .object({
      value: zT,
      label: z.string()
    })
    .meta({ id: 'SelectItem' });

  return schema;
};

// Zod's generic optional-key calculation cannot reduce until T is concrete.
// Check an instantiated output without annotating it as the native type.
assertTypesEqual<
  SelectItem<string>,
  z.infer<ReturnType<typeof zfSelectItem<z.ZodString>>>
>({ value: true });
