import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type EnvEntToTabError = GetTabPropsError;

export let zEnvEntToTabError = zGetTabPropsError;

assertTypesEqual<EnvEntToTabError, z.infer<typeof zEnvEntToTabError>>({
  value: true
});
