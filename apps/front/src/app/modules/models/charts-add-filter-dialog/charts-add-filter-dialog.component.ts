import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '~common/constants/top';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { getFractionTypeForAny } from '~common/functions/get-fraction-type-for-any';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { Filter } from '~common/interfaces/blockml/filter';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Model } from '~common/interfaces/blockml/model';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelFieldY } from '~common/interfaces/blockml/model-field-y';
import { ApiService } from '~front/app/services/api.service';
import { ChartService } from '~front/app/services/chart.service';
import { StructService } from '~front/app/services/struct.service';
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
        a.fieldClass !== FieldClassEnum.Dimension &&
        b.fieldClass === FieldClassEnum.Dimension
          ? 1
          : a.fieldClass === FieldClassEnum.Dimension &&
              b.fieldClass !== FieldClassEnum.Dimension
            ? -1
            : a.fieldClass !== FieldClassEnum.Filter &&
                b.fieldClass === FieldClassEnum.Filter
              ? 1
              : a.fieldClass === FieldClassEnum.Filter &&
                  b.fieldClass !== FieldClassEnum.Filter
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

    // this.filtersIsExpanded = true;

    let newMconfig = this.structService.makeMconfig();

    let newFraction: Fraction;

    let field = this.ref.data.model.fields.find(x => x.id === this.newFieldId);

    if (newMconfig.modelType === ModelTypeEnum.Store) {
      // if (newMconfig.isStoreModel === true) {
      let storeFilter =
        field.fieldClass === FieldClassEnum.Filter
          ? (this.ref.data.model.content as FileStore).fields.find(
              f => f.name === field.id
            )
          : undefined;

      let storeResultFraction =
        field.fieldClass === FieldClassEnum.Filter
          ? undefined
          : (this.ref.data.model.content as FileStore).results.find(
              r => r.result === field.result
            ).fraction_types[0];

      let logicGroup = isUndefined(storeResultFraction)
        ? undefined
        : FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = isUndefined(storeResultFraction)
        ? []
        : (this.ref.data.model.content as FileStore).results
            .find(r => r.result === field.result)
            .fraction_types.map(ft => {
              let options = [];

              let optionOr: FractionSubTypeOption = {
                logicGroup: FractionLogicEnum.Or,
                typeValue: ft.type,
                value: `${FractionLogicEnum.Or}${TRIPLE_UNDERSCORE}${ft.type}`,
                label: ft.label
              };
              options.push(optionOr);

              let optionAndNot: FractionSubTypeOption = {
                logicGroup: FractionLogicEnum.AndNot,
                value: `${FractionLogicEnum.AndNot}${TRIPLE_UNDERSCORE}${ft.type}`,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);

              return options;
            })
            .flat()
            .sort((a, b) => {
              if (a.logicGroup === b.logicGroup) return 0;
              return a.logicGroup === FractionLogicEnum.Or ? -1 : 1;
            });

      newFraction = {
        meta: storeResultFraction?.meta,
        operator: isUndefined(logicGroup)
          ? undefined
          : logicGroup === FractionLogicEnum.Or
            ? FractionOperatorEnum.Or
            : FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        type: FractionTypeEnum.StoreFraction,
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
          : (this.ref.data.model.content as FileStore).results
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
    } else if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(field.result)
      };
    } else {
      newFraction = {
        brick: 'any',
        operator: FractionOperatorEnum.Or,
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

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.WhereOrHaving,
          timezone: newMconfig.timezone,
          // fieldId: field.id,
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
    // let haystack = [
    //   isDefinedAndNotEmpty(modelFieldY.groupLabel)
    //     ? `${modelFieldY.topLabel} ${modelFieldY.groupLabel} - ${modelFieldY.label}`
    //     : `${modelFieldY.topLabel} ${modelFieldY.label}`
    // ];

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
