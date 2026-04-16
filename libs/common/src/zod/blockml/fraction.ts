import type { Moment } from '@malloydata/malloy-filter';
import { z } from 'zod';
import { FractionDayOfWeekValueEnum } from '#common/enums/fraction/fraction-day-of-week-value.enum';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { FractionMonthNameValueEnum } from '#common/enums/fraction/fraction-month-name-value.enum';
import { FractionNumberBetweenOptionEnum } from '#common/enums/fraction/fraction-number-between-option.enum';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionQuarterOfYearValueEnum } from '#common/enums/fraction/fraction-quarter-of-year-value.enum';
import { FractionTsLastCompleteOptionEnum } from '#common/enums/fraction/fraction-ts-last-complete-option.enum';
import { FractionTsMixUnitEnum } from '#common/enums/fraction/fraction-ts-mix-unit.enum';
import { FractionTsMomentTypeEnum } from '#common/enums/fraction/fraction-ts-moment-type.enum';
import { FractionTsUnitEnum } from '#common/enums/fraction/fraction-ts-unit.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { FractionYesnoValueEnum } from '#common/enums/fraction/fraction-yesno-value.enum';
import { zFractionControl } from '#common/zod/blockml/fraction-control';
import { zFractionSubTypeOption } from '#common/zod/blockml/fraction-sub-type-option';

// TODO: `brick`, `parentBrick`, `operator` are non-nullish to match the
// `Fraction` interface's required TS fields so zod-typed fractions flow into
// node-common helpers (bricksToFractions) without `as any` casts everywhere.
// Revisit once node-common migrates to zod types.
export let zFraction = z
  .object({
    controls: z.array(zFractionControl).nullish(),

    brick: z.string(),
    parentBrick: z.string(),
    operator: z.enum(FractionOperatorEnum),
    logicGroup: z.enum(FractionLogicEnum).nullish(),
    type: z.enum(FractionTypeEnum),

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
    numberBetweenOption: z.enum(FractionNumberBetweenOptionEnum).nullish(),
    yesnoValue: z.enum(FractionYesnoValueEnum).nullish(),
    dayOfWeekValue: z.enum(FractionDayOfWeekValueEnum).nullish(),
    dayOfWeekIndexValues: z.string().nullish(),
    monthNameValue: z.enum(FractionMonthNameValueEnum).nullish(),
    quarterOfYearValue: z.enum(FractionQuarterOfYearValueEnum).nullish(),

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
    tsForUnit: z.enum(FractionTsUnitEnum).nullish(),

    tsLastValue: z.number().nullish(),
    tsLastUnit: z.enum(FractionTsUnitEnum).nullish(),
    tsLastCompleteOption: z.enum(FractionTsLastCompleteOptionEnum).nullish(),

    tsNextValue: z.number().nullish(),
    tsNextUnit: z.enum(FractionTsUnitEnum).nullish(),

    tsMoment: z.custom<Moment>().nullish(),
    tsMomentType: z.enum(FractionTsMomentTypeEnum).nullish(),
    tsMomentUnit: z.enum(FractionTsMixUnitEnum).nullish(),
    tsTimestampValue: z.string().nullish(),
    tsMomentAgoFromNowQuantity: z.number().nullish(),

    tsFromMoment: z.custom<Moment>().nullish(),
    tsFromMomentType: z.enum(FractionTsMomentTypeEnum).nullish(),
    tsFromMomentUnit: z.enum(FractionTsMixUnitEnum).nullish(),
    tsFromTimestampValue: z.string().nullish(),
    tsFromMomentAgoFromNowQuantity: z.number().nullish(),

    tsToMoment: z.custom<Moment>().nullish(),
    tsToMomentType: z.enum(FractionTsMomentTypeEnum).nullish(),
    tsToMomentUnit: z.enum(FractionTsMixUnitEnum).nullish(),
    tsToTimestampValue: z.string().nullish(),
    tsToMomentAgoFromNowQuantity: z.number().nullish()
  })
  .meta({ id: 'Fraction' });

export type Fraction = z.infer<typeof zFraction>;
