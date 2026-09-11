import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskPilotResponseInfo = {
  path: string;
  method: string;
  duration: number;
  traceId: string;
};

export let zToDiskPilotResponseInfo = z.object({
  path: z.string(),
  method: z.string(),
  duration: z.number().nonnegative(),
  traceId: z.string()
});

assertTypesEqual<
  ToDiskPilotResponseInfo,
  z.infer<typeof zToDiskPilotResponseInfo>
>({ value: true });
