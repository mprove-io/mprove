import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDashboardIdChartIdAndReportIdAreNotDefinedError = {
  code: 'BACKEND_DASHBOARD_ID_CHART_ID_AND_REPORT_ID_ARE_NOT_DEFINED';
};

export let zBackendDashboardIdChartIdAndReportIdAreNotDefinedError = z.object({
  code: z.literal('BACKEND_DASHBOARD_ID_CHART_ID_AND_REPORT_ID_ARE_NOT_DEFINED')
});

assertTypesEqual<
  BackendDashboardIdChartIdAndReportIdAreNotDefinedError,
  z.infer<typeof zBackendDashboardIdChartIdAndReportIdAreNotDefinedError>
>({ value: true });
