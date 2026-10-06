import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const logLevelValues = ['Error', 'Info'] as const;

export type LogLevel = (typeof logLevelValues)[number];

export let zLogLevel = z.enum(logLevelValues);

assertTypesEqual<LogLevel, z.infer<typeof zLogLevel>>({
  value: true
});
