import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const emailTransportValues = ['SMTP'] as const;

export type EmailTransport = (typeof emailTransportValues)[number];

export let zEmailTransport = z.enum(emailTransportValues);

assertTypesEqual<EmailTransport, z.infer<typeof zEmailTransport>>({
  value: true
});
