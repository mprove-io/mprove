import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type EnvEntToTabResultError = GetTabPropsResultError;

export let zEnvEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  EnvEntToTabResultError,
  z.infer<typeof zEnvEntToTabResultError>
>({ value: true });
