import { z } from 'zod';
import type { SESSION_TAB_CREATED_EVENT_TYPE } from '#common/constants/top';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type SessionTabCreatedEventProperties = {
  tabId: string;
  chartId: string;
  chartType: EnumValues<typeof ChartTypeEnum>;
  title: string;
  modelId: string;
};

export type SessionTabCreatedEvent = {
  id: string;
  type: typeof SESSION_TAB_CREATED_EVENT_TYPE;
  properties: SessionTabCreatedEventProperties;
};

export let zSessionTabCreatedEventProperties = z
  .object({
    tabId: z.string(),
    chartId: z.string(),
    chartType: z.enum(ChartTypeEnum),
    title: z.string(),
    modelId: z.string()
  })
  .meta({ id: 'SessionTabCreatedEventProperties' });

assertTypesEqual<
  SessionTabCreatedEventProperties,
  z.infer<typeof zSessionTabCreatedEventProperties>
>({ value: true });
