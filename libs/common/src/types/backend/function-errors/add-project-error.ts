import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RebuildBlockmlStructError,
  zRebuildBlockmlStructError
} from '#common/types/backend/function-errors/rebuild-blockml-struct-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type AddProjectError =
  | SendToDiskError
  | RebuildBlockmlStructError
  | WriteError;

export let zAddProjectError = z.union([
  zSendToDiskError,
  zRebuildBlockmlStructError,
  zWriteError
]);

assertTypesEqual<AddProjectError, z.infer<typeof zAddProjectError>>({
  value: true
});
