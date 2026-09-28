import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserAliasIsUndefinedError = {
  code: 'BACKEND_USER_ALIAS_IS_UNDEFINED';
};

export let zBackendUserAliasIsUndefinedError = z.object({
  code: z.literal('BACKEND_USER_ALIAS_IS_UNDEFINED')
});

assertTypesEqual<
  BackendUserAliasIsUndefinedError,
  z.infer<typeof zBackendUserAliasIsUndefinedError>
>({ value: true });
