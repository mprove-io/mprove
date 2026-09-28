import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type EnvVarValueMustBeTrueOrFalseError = {
  code: 'ENV_VAR_VALUE_MUST_BE_TRUE_OR_FALSE';
};

export let zEnvVarValueMustBeTrueOrFalseError = z.object({
  code: z.literal('ENV_VAR_VALUE_MUST_BE_TRUE_OR_FALSE')
});

assertTypesEqual<
  EnvVarValueMustBeTrueOrFalseError,
  z.infer<typeof zEnvVarValueMustBeTrueOrFalseError>
>({ value: true });
