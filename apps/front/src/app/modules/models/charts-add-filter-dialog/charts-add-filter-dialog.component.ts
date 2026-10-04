import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ChartX } from '#common/types/backend/parts/chart/chart-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Filter } from '#common/types/blockml/parts/filter/filter';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionLogic } from '#common/types/blockml/parts/fraction/fraction-logic';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { ModelFieldY } from '#common/types/blockml/parts/model/model-field-y';
import { getFractionTypeForAny } from '#front/app/functions/get-fraction-type-for-any';
import { ApiService } from '#front/app/services/api.service';
import { ChartService } from '#front/app/services/chart.service';
import { StructService } from '#front/app/services/struct.service';
import { SharedModule } from '../../shared/shared.module';

export interface ChartsAddFilterDialogData {
  apiService: ApiService;
  chart: ChartX;
  model: Model;
  mconfig: MconfigX;
  parameterAddedFn: () => void;
}

@Component({
  selector: 'm-charts-add-filter-dialog',
  templateUrl: './charts-add-filter-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    TippyDirective,
    NgxSpinnerModule
  ]
})
export class ChartsAddFilterDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  chart: ChartX;
  sortedFieldsY: ModelFieldY[];

  addFilterForm: FormGroup;

  isFieldAlreadyFiltered = false;
  newFieldId: string;

  constructor(
    public ref: DialogRef<ChartsAddFilterDialogData>,
    private fb: FormBuilder,
    private structService: StructService,
    private chartService: ChartService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.addFilterForm = this.fb.group({
      field: [undefined]
    });

    this.chart = this.ref.data.chart;

    this.sortedFieldsY = this.ref.data.model.fields
      .filter(x => x.hidden === false)
      .map(x =>
        Object.assign({}, x, {
          partLabel: isDefined(x.groupLabel)
            ? `${x.topLabel} ${x.groupLabel} ${x.label}`
            : `${x.topLabel} ${x.label}`
        } as ModelFieldY)
      )
      .sort((a, b) =>
        a.fieldClass !== 'dimension' && b.fieldClass === 'dimension'
          ? 1
          : a.fieldClass === 'dimension' && b.fieldClass !== 'dimension'
            ? -1
            : a.fieldClass !== 'filter' && b.fieldClass === 'filter'
              ? 1
              : a.fieldClass === 'filter' && b.fieldClass !== 'filter'
                ? -1
                : a.partLabel > b.partLabel
                  ? 1
                  : b.partLabel > a.partLabel
                    ? -1
                    : 0
      );
  }

  fieldChange() {
    (document.activeElement as HTMLElement).blur();

    this.isFieldAlreadyFiltered =
      this.ref.data.mconfig.extendedFilters
        .map(ef => ef.fieldId)
        .indexOf(this.newFieldId) > -1;
  }

  save() {
    if (isUndefined(this.newFieldId)) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();

    let newFraction: Fraction;

    let field = this.ref.data.model.fields.find(x => x.id === this.newFieldId);

    if (newMconfig.modelType === 'Store') {
      let storeFilter =
        field.fieldClass === 'filter'
          ? this.ref.data.model.storeContent.fields.find(
              f => f.name === field.id
            )
          : undefined;

      let storeResultFraction =
        field.fieldClass === 'filter'
          ? undefined
          : this.ref.data.model.storeContent.results.find(
              r => r.result === field.result
            ).fraction_types[0];

      let logicGroup: FractionLogic = isUndefined(storeResultFraction)
        ? undefined
        : 'OR';

      let storeFractionSubTypeOptions = isUndefined(storeResultFraction)
        ? []
        : this.ref.data.model.storeContent.results
            .find(r => r.result === field.result)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: 'OR',
                typeValue: ft.type,
                value: `OR${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: 'AND_NOT',
                value: `AND_NOT${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === 'OR' ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFraction?.meta,
        operator: isUndefined(logicGroup)
          ? undefined
          : logicGroup === 'OR'
            ? 'Or'
            : 'And',
        logicGroup: logicGroup,
        brick: undefined,
        parentBrick: undefined,
        type: 'StoreFraction',
        storeResult: field.result,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFraction?.type,
        storeFractionSubTypeLabel: isDefined(storeResultFraction?.type)
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFraction?.type
            ).label
          : storeResultFraction?.type,
        storeFractionLogicGroupWithSubType:
          isDefined(logicGroup) && isDefined(storeResultFraction?.type)
            ? `${logicGroup}${TRIPLE_UNDERSCORE}${storeResultFraction.type}`
            : undefined,
        controls: isUndefined(storeResultFraction)
          ? storeFilter.fraction_controls.map(control => {
              let newControl: FractionControl = {
                options: control.options,
                value: control.value,
                label: control.label,
                required: control.required,
                name: control.name,
                controlClass: control.controlClass,
                isMetricsDate: control.isMetricsDate
              };
              return newControl;
            })
          : this.ref.data.model.storeContent.results
              .find(r => r.result === field.result)
              .fraction_types[0].controls.map(control => {
                let newControl: FractionControl = {
                  options: control.options,
                  value: control.value,
                  label: control.label,
                  required: control.required,
                  name: control.name,
                  controlClass: control.controlClass,
                  isMetricsDate: control.isMetricsDate
                };
                return newControl;
              })
      };
    } else if (newMconfig.modelType === 'Malloy') {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: 'Or',
        type: getFractionTypeForAny(field.result)
      };
    } else {
      newFraction = {
        brick: 'any',
        parentBrick: 'any',
        operator: 'Or',
        type: getFractionTypeForAny(field.result)
      };
    }

    let newFilters = [];

    let newFilter: Filter = {
      fieldId: field.id,
      fractions: [newFraction]
    };

    newFilters = [...newMconfig.filters, newFilter].sort((a, b) =>
      a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
    );

    if (newMconfig.modelType === 'Malloy') {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: 'WhereOrHaving',
          timezone: newMconfig.timezone,
          filters: newFilters
        }
      });
    } else {
      newMconfig.filters = newFilters;

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }

    this.ref.data.parameterAddedFn();

    this.ref.close();
  }

  searchFn(term: string, modelField: ModelField) {
    let haystack = [
      isDefinedAndNotEmpty(modelField.groupLabel)
        ? `${modelField.topLabel} ${modelField.groupLabel} - ${modelField.label}`
        : `${modelField.topLabel} ${modelField.label}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  cancel() {
    this.ref.close();
  }
}
