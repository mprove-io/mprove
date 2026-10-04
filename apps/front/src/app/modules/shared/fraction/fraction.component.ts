import { Component, EventEmitter, Input, Output } from '@angular/core';

import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionDayOfWeekValue } from '#common/types/blockml/parts/fraction/fraction-day-of-week-value';
import type { FractionMonthNameValue } from '#common/types/blockml/parts/fraction/fraction-month-name-value';
import type { FractionNumberBetweenOption } from '#common/types/blockml/parts/fraction/fraction-number-between-option';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import type { FractionQuarterOfYearValue } from '#common/types/blockml/parts/fraction/fraction-quarter-of-year-value';
import type { FractionTsLastCompleteOption } from '#common/types/blockml/parts/fraction/fraction-ts-last-complete-option';
import type { FractionTsMixUnit } from '#common/types/blockml/parts/fraction/fraction-ts-mix-unit';
import type { FractionTsMomentType } from '#common/types/blockml/parts/fraction/fraction-ts-moment-type';
import type { FractionTsUnit } from '#common/types/blockml/parts/fraction/fraction-ts-unit';
import type { FractionType } from '#common/types/blockml/parts/fraction/fraction-type';
import type { FractionYesnoValue } from '#common/types/blockml/parts/fraction/fraction-yesno-value';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';

export class FractionTypeItem {
  label: string;
  value: FractionType;
  operator: FractionOperator;
  timeframeLevel?: number;
}

export class FractionTsMomentTypesItem {
  label: string;
  value: FractionTsMomentType;
}

export class FractionTsMixUnitItem {
  label: string;
  value: FractionTsMixUnit;
  timeframeLevel: number;
}

export class FractionTsUnitItem {
  label: string;
  value: FractionTsUnit;
  timeframeLevel: number;
}

export class FractionDayOfWeekValueItem {
  label: string;
  value: FractionDayOfWeekValue;
}

export class FractionTsLastCompleteOptionItem {
  label: string;
  value: FractionTsLastCompleteOption;
}

export class FractionQuarterOfYearValueItem {
  label: string;
  value: FractionQuarterOfYearValue;
}

export class FractionMonthNameValueItem {
  label: string;
  value: FractionMonthNameValue;
}

export class FractionYesnoValueItem {
  label: string;
  value: FractionYesnoValue;
}

export class FractionNumberBetweenOptionItem {
  label: string;
  value: FractionNumberBetweenOption;
}

@Component({
  standalone: false,
  selector: 'm-fraction',
  templateUrl: './fraction.component.html'
})
export class FractionComponent {
  @Input() storeContent: FileStore;

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() chartId: string;
  @Input() dashboardId: string;
  @Input() reportId: string;
  @Input() rowId: string;

  @Input() metricsStartDateYYYYMMDD: string;
  @Input() metricsEndDateYYYYMMDD: string;

  @Input() isMetricsPage: boolean;
  @Input() isDisabled: boolean = false;
  @Input() fieldResult: FieldResult | string;
  @Input() fieldTimeframe: string;

  @Input() fraction: Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  constructor() {}
}
