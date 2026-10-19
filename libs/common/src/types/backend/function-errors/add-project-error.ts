import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type AddProjectError = SendToDiskError | RebuildStructError | WriteError;

export let zAddProjectError = z.union([
  zSendToDiskError,
  zRebuildStructError,
  zWriteError
]);

assertTypesEqual<AddProjectError, z.infer<typeof zAddProjectError>>({
  value: true
});
