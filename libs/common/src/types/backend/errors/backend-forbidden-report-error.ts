import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendForbiddenReportError = {
  code: 'BACKEND_FORBIDDEN_REPORT';
};

export let zBackendForbiddenReportError = z.object({
  code: z.literal('BACKEND_FORBIDDEN_REPORT')
});

assertTypesEqual<
  BackendForbiddenReportError,
  z.infer<typeof zBackendForbiddenReportError>
>({ value: true });
