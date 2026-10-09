import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ModelEntToTabResultError,
  zModelEntToTabResultError
} from '#common/types/backend/function-errors/model-ent-to-tab-result-error';

export type GetModelPartXsResultError = ModelEntToTabResultError;

export let zGetModelPartXsResultError = zModelEntToTabResultError;

assertTypesEqual<
  GetModelPartXsResultError,
  z.infer<typeof zGetModelPartXsResultError>
>({ value: true });
