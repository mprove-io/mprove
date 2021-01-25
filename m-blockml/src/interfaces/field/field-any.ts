import { Calculation } from '~/interfaces/field-types/calculation';
import { Dimension } from '~/interfaces/field-types/dimension';
import { Filter } from '~/interfaces/field-types/filter';
import { Measure } from '~/interfaces/field-types/measure';
import { Time } from '~/interfaces/field-types/time';

export interface FieldAny
  extends Dimension,
    Time,
    Measure,
    Calculation,
    Filter {}
