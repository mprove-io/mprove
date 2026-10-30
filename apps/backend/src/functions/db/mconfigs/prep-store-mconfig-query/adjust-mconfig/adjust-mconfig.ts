import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { getYYYYMMDDCurrentDateByTimezone } from '#backend/functions/yyyymmdd/get-yyyymmdd-current-date-by-timezone/get-yyyymmdd-current-date-by-timezone';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import { toBooleanFromLowercaseString } from '#common/functions/to-boolean-from-lowercase-string/to-boolean-from-lowercase-string';
import type { Filter } from '#common/types/blockml/parts/filter/filter';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';

export async function adjustMconfig(item: {
  mconfig: MconfigTab;
  model: ModelTab;
  caseSensitiveStringFilters: boolean;
  metricsStartDateYYYYMMDD: string;
  metricsEndDateYYYYMMDD: string;
}): Promise<MconfigTab> {
  let {
    model,
    mconfig,
    caseSensitiveStringFilters,
    metricsStartDateYYYYMMDD,
    metricsEndDateYYYYMMDD
  } = item;

  let newMconfig: MconfigTab = makeCopy(mconfig);

  newMconfig.mconfigId = makeId();

  newMconfig.dateRangeIncludesRightSide =
    isUndefined(model.storeContent.date_range_includes_right_side) ||
    toBooleanFromLowercaseString(
      model.storeContent.date_range_includes_right_side
    ) === true
      ? true
      : false;

  // add required filters
  model.storeContent.fields
    .filter(x => x.fieldClass === 'filter')
    .forEach(storeFilter => {
      if (toBooleanFromLowercaseString(storeFilter.required) === true) {
        let selectedFilter: Filter = newMconfig.filters.find(
          x => x.fieldId === `${storeFilter.name}`
        );

        if (isUndefined(selectedFilter)) {
          let newFraction: Fraction = {
            type: 'StoreFraction',
            controls: [] as any[],
            brick: undefined as any,
            parentBrick: undefined as any,
            operator: undefined as any
          };

          let newFilter: Filter = {
            fieldId: `${storeFilter.name}`,
            fractions: [newFraction]
          };

          newMconfig.filters.push(newFilter);

          selectedFilter = newFilter;
        }

        storeFilter.fraction_controls.forEach(storeFractionControl => {
          let selectedControl: FractionControl =
            selectedFilter.fractions[0].controls.find(
              x => x.name === storeFractionControl.name
            );

          if (isUndefined(selectedControl)) {
            let newControl: FractionControl = {
              isMetricsDate: storeFractionControl.isMetricsDate,
              options: storeFractionControl.options,
              value: storeFractionControl.value,
              label: storeFractionControl.label,
              required: storeFractionControl.required,
              name: storeFractionControl.name,
              controlClass: storeFractionControl.controlClass
            };

            selectedFilter.fractions[0].controls.push(newControl);
          }
        });
      }
    });

  newMconfig.filters.forEach(filter => {
    filter.fractions.forEach(fraction => {
      fraction.controls
        .filter(
          control =>
            isDefinedAndNotEmpty(control.value) &&
            typeof control.value === 'string'
        )
        .forEach(control => {
          let storeFilt: FieldAny = model.storeContent.fields
            .filter(storeField => storeField.fieldClass === 'filter')
            .find(storeField => storeField.name === filter.fieldId);

          let newValue =
            control.isMetricsDate === true &&
            (isDefined(metricsStartDateYYYYMMDD) ||
              isDefined(metricsEndDateYYYYMMDD))
              ? storeFilt.fraction_controls.find(fc => fc.name === control.name)
                  .value
              : control.value;

          let reg: RegExp = MyRegex.CAPTURE_S_REF();

          let r;

          while ((r = reg.exec(newValue))) {
            let reference = r[1];

            let target: any;

            if (
              reference === 'METRICS_DATE_FROM' &&
              control.controlClass === 'date_picker'
            ) {
              target = isDefined(metricsStartDateYYYYMMDD)
                ? metricsStartDateYYYYMMDD
                : getYYYYMMDDCurrentDateByTimezone({
                    timezone: mconfig.timezone,
                    deltaDays: -1
                  });
            } else if (
              reference === 'METRICS_DATE_TO' &&
              control.controlClass === 'date_picker'
            ) {
              target = isDefined(metricsEndDateYYYYMMDD)
                ? metricsEndDateYYYYMMDD
                : getYYYYMMDDCurrentDateByTimezone({
                    timezone: mconfig.timezone,
                    deltaDays: 1
                  });
            } else if (reference === 'DATE_TODAY') {
              target = getYYYYMMDDCurrentDateByTimezone({
                timezone: mconfig.timezone,
                deltaDays: 0
              });
            } else if (reference === 'PROJECT_CONFIG_CASE_SENSITIVE') {
              target = caseSensitiveStringFilters;
            } else {
              target = null;
            }

            newValue = MyRegex.replaceSRefs(newValue, reference, target);
          }

          control.value =
            control.controlClass === 'switch' && typeof newValue === 'string'
              ? toBooleanFromLowercaseString(newValue)
              : newValue;
        });
    });
  });

  let addSelect: string[] = [];

  model.storeContent.fields
    .filter(
      storeField =>
        storeField.fieldClass !== 'filter' &&
        toBooleanFromLowercaseString(storeField.required) === true
    )
    .forEach(field => {
      if (newMconfig.select.indexOf(field.name) < 0) {
        addSelect.push(field.name);
      }
    });

  newMconfig.select = [...newMconfig.select, ...addSelect];

  return newMconfig;
}
