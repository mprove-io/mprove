import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';

export type AddOrgError = SendToDiskError | DbErrorToError;

export let zAddOrgError = z.union([zSendToDiskError, zDbErrorToError]);

assertTypesEqual<AddOrgError, z.infer<typeof zAddOrgError>>({
  value: true
});
