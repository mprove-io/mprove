import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const archiveReasonValues = ['User', 'Expire', 'Commit'] as const;

export type ArchiveReason = (typeof archiveReasonValues)[number];

export let zArchiveReason = z.enum(archiveReasonValues);

assertTypesEqual<ArchiveReason, z.infer<typeof zArchiveReason>>({
  value: true
});
