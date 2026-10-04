import type { Moment } from '@malloydata/malloy-filter';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FractionControl,
  zFractionControl
} from '#common/types/blockml/parts/fraction/fraction-control';
import {
  type FractionDayOfWeekValue,
  zFractionDayOfWeekValue
} from '#common/types/blockml/parts/fraction/fraction-day-of-week-value';
import {
  type FractionLogic,
  zFractionLogic
} from '#common/types/blockml/parts/fraction/fraction-logic';
import {
  type FractionMonthNameValue,
  zFractionMonthNameValue
} from '#common/types/blockml/parts/fraction/fraction-month-name-value';
import {
  type FractionNumberBetweenOption,
  zFractionNumberBetweenOption
} from '#common/types/blockml/parts/fraction/fraction-number-between-option';
import {
  type FractionOperator,
  zFractionOperator
} from '#common/types/blockml/parts/fraction/fraction-operator';
import {
  type FractionQuarterOfYearValue,
  zFractionQuarterOfYearValue
} from '#common/types/blockml/parts/fraction/fraction-quarter-of-year-value';
import {
  type FractionSubTypeOption,
  zFractionSubTypeOption
} from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import {
  type FractionTsLastCompleteOption,
  zFractionTsLastCompleteOption
} from '#common/types/blockml/parts/fraction/fraction-ts-last-complete-option';
import {
  type FractionTsMixUnit,
  zFractionTsMixUnit
} from '#common/types/blockml/parts/fraction/fraction-ts-mix-unit';
import {
  type FractionTsMomentType,
  zFractionTsMomentType
} from '#common/types/blockml/parts/fraction/fraction-ts-moment-type';
import {
  type FractionTsUnit,
  zFractionTsUnit
} from '#common/types/blockml/parts/fraction/fraction-ts-unit';
import {
  type FractionType,
  zFractionType
} from '#common/types/blockml/parts/fraction/fraction-type';
import {
  type FractionYesnoValue,
  zFractionYesnoValue
} from '#common/types/blockml/parts/fraction/fraction-yesno-value';

export type Fraction = {
  controls?: FractionControl[];
  brick?: string;
  parentBrick?: string;
  operator?: FractionOperator;
  logicGroup?: FractionLogic;
  type: FractionType;
  storeFractionSubTypeOptions?: FractionSubTypeOption[];
  storeFractionSubType?: string;
  storeFractionSubTypeLabel?: string;
  storeFractionLogicGroupWithSubType?: string;
  meta?: any;
  storeResult?: string;
  stringValue?: string;
  numberValue1?: number;
  numberValue2?: number;
  numberValues?: string;
  numberBetweenOption?: FractionNumberBetweenOption;
  yesnoValue?: FractionYesnoValue;
  dayOfWeekValue?: FractionDayOfWeekValue;
  dayOfWeekIndexValues?: string;
  monthNameValue?: FractionMonthNameValue;
  quarterOfYearValue?: FractionQuarterOfYearValue;
  tsDateYear?: number;
  tsDateQuarter?: number;
  tsDateMonth?: number;
  tsDateDay?: number;
  tsDateHour?: number;
  tsDateMinute?: number;
  tsDateToYear?: number;
  tsDateToQuarter?: number;
  tsDateToMonth?: number;
  tsDateToDay?: number;
  tsDateToHour?: number;
  tsDateToMinute?: number;
  tsForValue?: number;
  tsForUnit?: FractionTsUnit;
  tsLastValue?: number;
  tsLastUnit?: FractionTsUnit;
  tsLastCompleteOption?: FractionTsLastCompleteOption;
  tsNextValue?: number;
  tsNextUnit?: FractionTsUnit;
  tsMoment?: Moment;
  tsMomentType?: FractionTsMomentType;
  tsMomentUnit?: FractionTsMixUnit;
  tsTimestampValue?: string;
  tsMomentAgoFromNowQuantity?: number;
  tsFromMoment?: Moment;
  tsFromMomentType?: FractionTsMomentType;
  tsFromMomentUnit?: FractionTsMixUnit;
  tsFromTimestampValue?: string;
  tsFromMomentAgoFromNowQuantity?: number;
  tsToMoment?: Moment;
  tsToMomentType?: FractionTsMomentType;
  tsToMomentUnit?: FractionTsMixUnit;
  tsToTimestampValue?: string;
  tsToMomentAgoFromNowQuantity?: number;
};

export let zFraction = z
  .object({
    controls: z.array(zFractionControl).nullish(),

    brick: z.string().nullish(),
    parentBrick: z.string().nullish(),
    operator: zFractionOperator.nullish(),
    logicGroup: zFractionLogic.nullish(),
    type: zFractionType,

    storeFractionSubTypeOptions: z.array(zFractionSubTypeOption).nullish(),
    storeFractionSubType: z.string().nullish(),
    storeFractionSubTypeLabel: z.string().nullish(),
    storeFractionLogicGroupWithSubType: z.string().nullish(),

    meta: z.any().nullish(),

    storeResult: z.string().nullish(),
    stringValue: z.string().nullish(),
    numberValue1: z.number().nullish(),
    numberValue2: z.number().nullish(),
    numberValues: z.string().nullish(),
    numberBetweenOption: zFractionNumberBetweenOption.nullish(),
    yesnoValue: zFractionYesnoValue.nullish(),
    dayOfWeekValue: zFractionDayOfWeekValue.nullish(),
    dayOfWeekIndexValues: z.string().nullish(),
    monthNameValue: zFractionMonthNameValue.nullish(),
    quarterOfYearValue: zFractionQuarterOfYearValue.nullish(),

    tsDateYear: z.number().nullish(),
    tsDateQuarter: z.number().nullish(),
    tsDateMonth: z.number().nullish(),
    tsDateDay: z.number().nullish(),
    tsDateHour: z.number().nullish(),
    tsDateMinute: z.number().nullish(),

    tsDateToYear: z.number().nullish(),
    tsDateToQuarter: z.number().nullish(),
    tsDateToMonth: z.number().nullish(),
    tsDateToDay: z.number().nullish(),
    tsDateToHour: z.number().nullish(),
    tsDateToMinute: z.number().nullish(),

    tsForValue: z.number().nullish(),
    tsForUnit: zFractionTsUnit.nullish(),

    tsLastValue: z.number().nullish(),
    tsLastUnit: zFractionTsUnit.nullish(),
    tsLastCompleteOption: zFractionTsLastCompleteOption.nullish(),

    tsNextValue: z.number().nullish(),
    tsNextUnit: zFractionTsUnit.nullish(),

    tsMoment: z.custom<Moment>().nullish(),
    tsMomentType: zFractionTsMomentType.nullish(),
    tsMomentUnit: zFractionTsMixUnit.nullish(),
    tsTimestampValue: z.string().nullish(),
    tsMomentAgoFromNowQuantity: z.number().nullish(),

    tsFromMoment: z.custom<Moment>().nullish(),
    tsFromMomentType: zFractionTsMomentType.nullish(),
    tsFromMomentUnit: zFractionTsMixUnit.nullish(),
    tsFromTimestampValue: z.string().nullish(),
    tsFromMomentAgoFromNowQuantity: z.number().nullish(),

    tsToMoment: z.custom<Moment>().nullish(),
    tsToMomentType: zFractionTsMomentType.nullish(),
    tsToMomentUnit: zFractionTsMixUnit.nullish(),
    tsToTimestampValue: z.string().nullish(),
    tsToMomentAgoFromNowQuantity: z.number().nullish()
  })
  .meta({ id: 'Fraction' });

assertTypesEqual<Fraction, z.infer<typeof zFraction>>({ value: true });
