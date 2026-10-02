import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendIsOrgExistOutput,
  zToBackendIsOrgExistOutput
} from '#common/types/backend/routes/orgs/is-org-exist/is-org-exist-output';
import {
  type ToBackendIsOrgExistError,
  zToBackendIsOrgExistError
} from './is-org-exist-error';

export type ToBackendIsOrgExistResponse = ToBackendResponseBase<
  'isOrgExist',
  ToBackendIsOrgExistOutput,
  ToBackendIsOrgExistError
>;

export let zToBackendIsOrgExistResponse = makeToBackendResponseSchema({
  operation: 'isOrgExist',
  output: zToBackendIsOrgExistOutput,
  error: zToBackendIsOrgExistError
}).meta({ id: 'ToBackendIsOrgExistResponse' });

assertTypesEqual<
  ToBackendIsOrgExistResponse,
  z.infer<typeof zToBackendIsOrgExistResponse>
>({ value: true });
