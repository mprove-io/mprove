import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';

export type BackendEditDraftDashboardFailedError = {
  code: 'BACKEND_EDIT_DRAFT_DASHBOARD_FAILED';
  displayData?: { structErrors: BmlError[] };
};

export let zBackendEditDraftDashboardFailedError = z.object({
  code: z.literal('BACKEND_EDIT_DRAFT_DASHBOARD_FAILED'),
  displayData: z.object({ structErrors: z.array(zBmlError) }).nullish()
});

assertTypesEqual<
  BackendEditDraftDashboardFailedError,
  z.infer<typeof zBackendEditDraftDashboardFailedError>
>({ value: true });
