import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const opencodeStreamCommandValues = ['interact', 'stop', 'fetch'] as const;

export type OpencodeStreamCommand =
  (typeof opencodeStreamCommandValues)[number];

export let zOpencodeStreamCommand = z.enum(opencodeStreamCommandValues);

assertTypesEqual<OpencodeStreamCommand, z.infer<typeof zOpencodeStreamCommand>>(
  {
    value: true
  }
);
