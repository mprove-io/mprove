import type { SESSION_TAB_CREATED_EVENT_TYPE } from '#common/constants/top';
import type { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
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
