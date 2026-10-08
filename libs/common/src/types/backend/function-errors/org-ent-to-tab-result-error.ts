import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type OrgEntToTabResultError = GetTabPropsResultError;

export let zOrgEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  OrgEntToTabResultError,
  z.infer<typeof zOrgEntToTabResultError>
>({ value: true });
