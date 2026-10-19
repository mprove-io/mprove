import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type AddOrgError = SendToDiskError | WriteError;

export let zAddOrgError = z.union([zSendToDiskError, zWriteError]);

assertTypesEqual<AddOrgError, z.infer<typeof zAddOrgError>>({
  value: true
});
