import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '~front/app/services/api.service';
import { common } from '~front/barrels/common';
import { SharedModule } from '../../shared/shared.module';

import uFuzzy from '@leeoniya/ufuzzy';
import { TippyDirective } from '@ngneat/helipopper';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { ChartService } from '~front/app/services/chart.service';
import { StructService } from '~front/app/services/struct.service';

export interface ChartsAddFilterDialogData {
  apiService: ApiService;
  chart: common.ChartX;
  model: common.Model;
  mconfig: common.MconfigX;
  fields: common.ModelFieldY[];
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

  chart: common.ChartX;
  fields: common.ModelFieldY[];
  matchFields: common.ModelField[];

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

    this.fields = this.ref.data.fields;

    this.matchFields = this.fields
      .filter(
        x => x.hidden === false && x.fieldClass !== common.FieldClassEnum.Filter
      )
      .sort((a, b) =>
        a.fieldClass !== common.FieldClassEnum.Dimension &&
        b.fieldClass === common.FieldClassEnum.Dimension
          ? -1
          : a.fieldClass === common.FieldClassEnum.Dimension &&
              b.fieldClass !== common.FieldClassEnum.Dimension
            ? 1
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
    if (common.isUndefined(this.newFieldId)) {
      return;
    }

    // this.filtersIsExpanded = true;

    let newMconfig = this.structService.makeMconfig();

    let newFraction: common.Fraction;

    let field = this.ref.data.model.fields.find(x => x.id === this.newFieldId);

    if (newMconfig.modelType === common.ModelTypeEnum.Store) {
      // if (newMconfig.isStoreModel === true) {
      let storeFilter =
        field.fieldClass === common.FieldClassEnum.Filter
          ? (this.ref.data.model.content as common.FileStore).fields.find(
              f => f.name === field.id
            )
          : undefined;

      let storeResultFraction =
        field.fieldClass === common.FieldClassEnum.Filter
          ? undefined
          : (this.ref.data.model.content as common.FileStore).results.find(
              r => r.result === field.result
            ).fraction_types[0];

      let logicGroup = common.isUndefined(storeResultFraction)
        ? undefined
        : common.FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = common.isUndefined(storeResultFraction)
        ? []
        : (this.ref.data.model.content as common.FileStore).results
            .find(r => r.result === field.result)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: common.FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${common.FractionLogicEnum.Or}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: common.FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.AndNot,
                value: `${common.FractionLogicEnum.AndNot}${common.TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === common.FractionLogicEnum.Or ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFraction?.meta,
        operator: common.isUndefined(logicGroup)
          ? undefined
          : logicGroup === common.FractionLogicEnum.Or
            ? common.FractionOperatorEnum.Or
            : common.FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        type: common.FractionTypeEnum.StoreFraction,
        storeResult: field.result,
        storeFractionSubTypeOptions: storeFractionSubTypeOptions,
        storeFractionSubType: storeResultFraction?.type,
        storeFractionSubTypeLabel: common.isDefined(storeResultFraction?.type)
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFraction?.type
            ).label
          : storeResultFraction?.type,
        storeFractionLogicGroupWithSubType:
          common.isDefined(logicGroup) &&
          common.isDefined(storeResultFraction?.type)
            ? `${logicGroup}${common.TRIPLE_UNDERSCORE}${storeResultFraction.type}`
            : undefined,
        controls: common.isUndefined(storeResultFraction)
          ? storeFilter.fraction_controls.map(control => {
              let newControl: common.FractionControl = {
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
          : (this.ref.data.model.content as common.FileStore).results
              .find(r => r.result === field.result)
              .fraction_types[0].controls.map(control => {
                let newControl: common.FractionControl = {
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
    } else if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(field.result)
      };
    } else {
      newFraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(field.result)
      };
    }

    let newFilters = [];

    let newFilter: common.Filter = {
      fieldId: field.id,
      fractions: [newFraction]
    };

    newFilters = [...newMconfig.filters, newFilter].sort((a, b) =>
      a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0
    );

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: common.QueryOperationTypeEnum.WhereOrHaving,
          timezone: newMconfig.timezone,
          fieldId: field.id,
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

    this.ref.close();
  }

  searchFn(term: string, modelField: common.ModelField) {
    // let haystack = [
    //   common.isDefinedAndNotEmpty(modelFieldY.groupLabel)
    //     ? `${modelFieldY.topLabel} ${modelFieldY.groupLabel} - ${modelFieldY.label}`
    //     : `${modelFieldY.topLabel} ${modelFieldY.label}`
    // ];

    let haystack = [
      common.isDefinedAndNotEmpty(modelField.groupLabel)
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
