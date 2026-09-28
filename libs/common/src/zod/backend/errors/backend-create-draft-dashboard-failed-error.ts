import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type BmlError, zBmlError } from '#common/zod/blockml/bml-error';

export type BackendCreateDraftDashboardFailedError = {
  code: 'BACKEND_CREATE_DRAFT_DASHBOARD_FAILED';
  displayData?: { structErrors: BmlError[] };
};

export let zBackendCreateDraftDashboardFailedError = z.object({
  code: z.literal('BACKEND_CREATE_DRAFT_DASHBOARD_FAILED'),
  displayData: z.object({ structErrors: z.array(zBmlError) }).nullish()
});

assertTypesEqual<
  BackendCreateDraftDashboardFailedError,
  z.infer<typeof zBackendCreateDraftDashboardFailedError>
>({ value: true });
