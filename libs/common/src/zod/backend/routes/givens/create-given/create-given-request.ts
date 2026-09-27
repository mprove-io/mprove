import { z } from 'zod';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateGivenInput = {
  projectId: string;
  givenId: string;
  type:
    | GivenTypeEnum.String
    | GivenTypeEnum.Number
    | GivenTypeEnum.Boolean
    | GivenTypeEnum.Date
    | GivenTypeEnum.Timestamp;
  isMultiple: boolean;
  values: string[];
};

export type ToBackendCreateGivenRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateGivenInput;
};

export let zToBackendCreateGivenInput = z
  .object({
    projectId: z.string(),
    givenId: z.string().regex(MyRegex.GIVEN_ID(), {
      message:
        'givenId must start with an uppercase letter or underscore and contain only uppercase letters, digits and underscores'
    }),
    type: z.enum(GivenTypeEnum),
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'ToBackendCreateGivenInput' });

export let zToBackendCreateGivenRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateGivenInput
  })
  .meta({ id: 'ToBackendCreateGivenRequest' });

assertTypesEqual<
  ToBackendCreateGivenInput,
  z.infer<typeof zToBackendCreateGivenInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateGivenRequest,
  z.infer<typeof zToBackendCreateGivenRequest>
>({ value: true });
