import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { IRowNode } from 'ag-grid-community';
import { MALLOY_FILTER_ANY, TRIPLE_UNDERSCORE } from '~common/constants/top';
import { ChangeTypeEnum } from '~common/enums/change-type.enum';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { getFractionTypeForAny } from '~common/functions/get-fraction-type-for-any';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { FilterX } from '~common/interfaces/backend/filter-x';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { Parameter } from '~common/interfaces/blockml/parameter';
import { RowChange } from '~common/interfaces/blockml/row-change';
import { DataRow } from '~common/interfaces/front/data-row';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
import { ModelsQuery } from '~front/app/queries/models.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ReportService } from '~front/app/services/report.service';
import { FilterX2 } from '../row/row.component';

@Component({
  standalone: false,
  selector: 'm-row-filters',
  templateUrl: './row-filters.component.html'
})
export class RowFiltersComponent {
  @Input()
  reportSelectedNode: IRowNode<DataRow>;

  @Input()
  mconfig: MconfigX;

  @Input()
  parametersFilters: FilterX2[];

  @Input()
  report: ReportX;

  constructor(
    private fb: FormBuilder,
    private reportQuery: ReportQuery,
    private reportService: ReportService,
    private structQuery: StructQuery,
    private modelsQuery: ModelsQuery,
    private cd: ChangeDetectorRef
  ) {}

  fractionUpdate(
    filterExtended: FilterX,
    eventFractionUpdate: EventFractionUpdate
  ) {
    // console.log('this.reportSelectedNode.data.parameters');
    // console.log(this.reportSelectedNode.data.parameters);

    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
    );

    let fractions = filterExtended.fractions;

    let newFractions = [
      ...fractions.slice(0, eventFractionUpdate.fractionIndex),
      eventFractionUpdate.fraction,
      ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    ];

    // let metric = this.structQuery
    //   .getValue()
    //   .metrics.find(y => y.metricId === this.reportSelectedNode.data.metricId);

    // let isStore = metric.modelId.startsWith(STORE_MODEL_PREFIX);

    let newParameter = Object.assign({}, newParameters[parametersIndex], {
      // conditions:
      //   isStore === false
      //     ? newFractions.map(fraction => fraction.brick)
      //     : undefined,
      fractions: newFractions
      // fractions: isStore === true ? newFractions : undefined
    } as Parameter);

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      newParameter,
      ...newParameters.slice(parametersIndex + 1)
    ];

    // console.log('newParameters');
    // console.log(newParameters);

    let report = this.reportQuery.getValue();

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  addFraction(filterExtended: FilterX) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
    );

    let fractions = filterExtended.fractions;

    let newFraction: Fraction;

    let metric = this.structQuery
      .getValue()
      .metrics.find(y => y.metricId === this.reportSelectedNode.data.metricId);

    if (metric.modelType === ModelTypeEnum.Store) {
      let store = this.modelsQuery
        .getValue()
        .models.find(m => m.modelId === metric.modelId).content as FileStore;

      let field = filterExtended.field;

      let storeFilter =
        field.fieldClass === FieldClassEnum.Filter
          ? store.fields.find(f => f.name === field.id)
          : undefined;

      let storeResultFirstTypeFraction =
        field.fieldClass === FieldClassEnum.Filter
          ? undefined
          : store.results.find(r => r.result === field.result)
              .fraction_types[0];

      let logicGroup = isUndefined(storeResultFirstTypeFraction)
        ? undefined
        : FractionLogicEnum.Or;

      let storeFractionSubTypeOptions = isUndefined(
        storeResultFirstTypeFraction
      )
        ? []
        : store.results
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
        meta: storeResultFirstTypeFraction?.meta,
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
        storeFractionSubType: storeResultFirstTypeFraction?.type,
        storeFractionSubTypeLabel: isDefined(storeResultFirstTypeFraction?.type)
          ? storeFractionSubTypeOptions.find(
              k => k.typeValue === storeResultFirstTypeFraction?.type
            ).label
          : storeResultFirstTypeFraction?.type,
        storeFractionLogicGroupWithSubType:
          isDefined(logicGroup) && isDefined(storeResultFirstTypeFraction?.type)
            ? `${logicGroup}${TRIPLE_UNDERSCORE}${storeResultFirstTypeFraction.type}`
            : undefined,
        controls: isUndefined(storeResultFirstTypeFraction)
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
          : storeResultFirstTypeFraction.controls.map(control => {
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
    } else if (metric.modelType === ModelTypeEnum.Malloy) {
      newFraction = {
        brick: MALLOY_FILTER_ANY,
        parentBrick: MALLOY_FILTER_ANY,
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(filterExtended.field.result)
      };
    } else {
      newFraction = {
        brick: 'any',
        operator: FractionOperatorEnum.Or,
        type: getFractionTypeForAny(filterExtended.field.result)
      };
    }

    let newFractions = [...fractions, newFraction];

    let newParameter = Object.assign({}, newParameters[parametersIndex], {
      // conditions:
      //   isStore === false
      //     ? newFractions.map(fraction => fraction.brick)
      //     : undefined,
      fractions: newFractions
    } as Parameter);

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      newParameter,
      ...newParameters.slice(parametersIndex + 1)
    ];

    let report = this.reportQuery.getValue();

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  deleteFraction(filterExtended: FilterX, fractionIndex: number) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
    );

    let fractions = filterExtended.fractions;

    if (fractions.length === 1) {
      newParameters = [
        ...newParameters.slice(0, parametersIndex),
        ...newParameters.slice(parametersIndex + 1)
      ];
    } else {
      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      // let metric = this.structQuery
      //   .getValue()
      //   .metrics.find(
      //     y => y.metricId === this.reportSelectedNode.data.metricId
      //   );

      // let isStore = metric.modelId.startsWith(STORE_MODEL_PREFIX);

      let newParameter = Object.assign({}, newParameters[parametersIndex], {
        // conditions:
        //   isStore === false
        //     ? newFractions.map(fraction => fraction.brick)
        //     : undefined,
        fractions: newFractions
      } as Parameter);

      newParameters = [
        ...newParameters.slice(0, parametersIndex),
        newParameter,
        ...newParameters.slice(parametersIndex + 1)
      ];
    }

    let report = this.reportQuery.getValue();

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  deleteFilter(filterExtended: FilterX) {
    let newParameters = [...this.reportSelectedNode.data.parameters];

    let parametersIndex = newParameters.findIndex(
      p => p.apply_to === filterExtended.fieldId
    );

    newParameters = [
      ...newParameters.slice(0, parametersIndex),
      ...newParameters.slice(parametersIndex + 1)
    ];

    let report = this.reportQuery.getValue();

    let rowChange: RowChange = {
      rowId: this.reportSelectedNode.data.rowId,
      parameters: newParameters
    };

    this.reportService.modifyRows({
      report: report,
      changeType: ChangeTypeEnum.EditParameters,
      rowChange: rowChange,
      rowIds: undefined,
      reportFields: report.fields,
      chart: undefined
    });
  }

  getModelContent() {
    let metric = this.structQuery
      .getValue()
      .metrics.find(y => y.metricId === this.reportSelectedNode.data.metricId);

    return this.modelsQuery
      .getValue()
      .models.find(x => x.modelId === metric?.modelId)?.content;
  }
}
