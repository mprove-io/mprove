import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const destinationChangeStatusValues = ['deleted', 'modified', 'new'] as const;

export type DestinationChangeStatus =
  (typeof destinationChangeStatusValues)[number];

export let zDestinationChangeStatus = z.enum(destinationChangeStatusValues);

assertTypesEqual<
  DestinationChangeStatus,
  z.infer<typeof zDestinationChangeStatus>
>({
  value: true
});
