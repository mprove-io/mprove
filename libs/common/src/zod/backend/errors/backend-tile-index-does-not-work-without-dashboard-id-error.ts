import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendTileIndexDoesNotWorkWithoutDashboardIdError = {
  code: 'BACKEND_TILE_INDEX_DOES_NOT_WORK_WITHOUT_DASHBOARD_ID';
};

export let zBackendTileIndexDoesNotWorkWithoutDashboardIdError = z.object({
  code: z.literal('BACKEND_TILE_INDEX_DOES_NOT_WORK_WITHOUT_DASHBOARD_ID')
});

assertTypesEqual<
  BackendTileIndexDoesNotWorkWithoutDashboardIdError,
  z.infer<typeof zBackendTileIndexDoesNotWorkWithoutDashboardIdError>
>({ value: true });
