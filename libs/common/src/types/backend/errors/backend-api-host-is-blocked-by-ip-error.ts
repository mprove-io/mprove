import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendApiHostIsBlockedByIpError = {
  code: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP';
  displayData?: {
    hostname: string;
    ipString: string;
    resolvedRecordAddress?: string;
    tag: string;
    type: string;
  };
};

export let zBackendApiHostIsBlockedByIpError = z.object({
  code: z.literal('BACKEND_API_HOST_IS_BLOCKED_BY_IP'),
  displayData: z
    .object({
      hostname: z.string(),
      ipString: z.string(),
      resolvedRecordAddress: z.string().nullish(),
      tag: z.string(),
      type: z.string()
    })
    .nullish()
});

assertTypesEqual<
  BackendApiHostIsBlockedByIpError,
  z.infer<typeof zBackendApiHostIsBlockedByIpError>
>({ value: true });
