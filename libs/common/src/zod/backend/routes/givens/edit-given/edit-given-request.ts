import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendEditGivenInput = {
  projectId: string;
  givenId: string;
  values: string[];
};

export type ToBackendEditGivenRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditGivenInput;
};

export let zToBackendEditGivenInput = z
  .object({
    projectId: z.string(),
    givenId: z.string().regex(MyRegex.GIVEN_ID(), {
      message:
        'givenId must start with an uppercase letter or underscore and contain only uppercase letters, digits and underscores'
    }),
    values: z.array(z.string())
  })
  .meta({ id: 'ToBackendEditGivenInput' });

export let zToBackendEditGivenRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditGivenInput
  })
  .meta({ id: 'ToBackendEditGivenRequest' });

assertTypesEqual<
  ToBackendEditGivenInput,
  z.infer<typeof zToBackendEditGivenInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditGivenRequest,
  z.infer<typeof zToBackendEditGivenRequest>
>({ value: true });
