import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const fileExtensionValues = [
  '.malloy',
  '.schema',
  '.store',
  '.chart',
  '.report',
  '.dashboard',
  '.space',
  '.yml',
  '.md'
] as const;

export type FileExtension = (typeof fileExtensionValues)[number];

export let zFileExtension = z.enum(fileExtensionValues);

assertTypesEqual<FileExtension, z.infer<typeof zFileExtension>>({
  value: true
});
