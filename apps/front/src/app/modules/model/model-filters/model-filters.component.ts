import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { toBooleanFromLowercaseString } from '~common/functions/to-boolean-from-lowercase-string';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { MqQuery } from '~front/app/queries/mq.query';
import { MconfigService } from '~front/app/services/mconfig.service';
import { StructService } from '~front/app/services/struct.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-model-filters',
  templateUrl: './model-filters.component.html'
})
export class ModelFiltersComponent {
  @Input() modelContent: any;

  mconfig: common.MconfigX;
  mconfig$ = this.mqQuery.mconfig$.pipe(
    tap(x => {
      this.mconfig = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private mqQuery: MqQuery,
    private cd: ChangeDetectorRef,
    private structService: StructService,
    private mconfigService: MconfigService
  ) {}

  fractionUpdate(
    filterExtended: common.FilterX,
    extendedFilterIndex: number, // TODO: check why index is different from filters index (store)
    eventFractionUpdate: interfaces.EventFractionUpdate
  ) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    let newFractions = [
      ...fractions.slice(0, eventFractionUpdate.fractionIndex),
      eventFractionUpdate.fraction,
      ...fractions.slice(eventFractionUpdate.fractionIndex + 1)
    ];

    let newFilter = Object.assign({}, filterExtended, {
      fractions: newFractions
    });

    let filterIndex = newMconfig.filters
      .map(y => y.fieldId)
      .indexOf(filterExtended.fieldId);

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  addFraction(filterExtended: common.FilterX, filterIndex: number) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    let newFraction: common.Fraction;

    if (newMconfig.isStoreModel === true) {
      let field = filterExtended.field;

      let storeResultFirstTypeFraction = (
        this.modelContent as common.FileStore
      ).results.find(r => r.result === field.result).fraction_types[0];

      let logicGroup =
        common.isUndefined(storeResultFirstTypeFraction.or) ||
        toBooleanFromLowercaseString(storeResultFirstTypeFraction.or) === true
          ? common.FractionLogicEnum.Or
          : common.FractionLogicEnum.AndNot;

      newFraction = {
        meta: storeResultFirstTypeFraction.meta,
        operator:
          logicGroup === common.FractionLogicEnum.Or
            ? common.FractionOperatorEnum.Or
            : common.FractionOperatorEnum.And,
        logicGroup: logicGroup,
        brick: undefined,
        type: common.FractionTypeEnum.StoreFraction,
        storeResult: field.result,
        storeFractionSubType: storeResultFirstTypeFraction.type,
        storeFractionLogicGroupWithSubType:
          logicGroup + storeResultFirstTypeFraction.type,
        storeFractionSubTypeOptions: (
          this.modelContent as common.FileStore
        ).results
          .find(r => r.result === field.result)
          .fraction_types.map(ft => {
            let options = [];

            if (
              common.isUndefined(ft.or) ||
              toBooleanFromLowercaseString(ft.or) === true
            ) {
              let optionOr: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.Or,
                typeValue: ft.type,
                value: common.FractionLogicEnum.Or + ft.type,
                label: ft.label
              };
              options.push(optionOr);
            }

            if (
              common.isUndefined(ft.and_not) ||
              toBooleanFromLowercaseString(ft.and_not) === true
            ) {
              let optionAndNot: FractionSubTypeOption = {
                logicGroup: common.FractionLogicEnum.AndNot,
                value: common.FractionLogicEnum.AndNot + ft.type,
                typeValue: ft.type,
                label: ft.label
              };
              options.push(optionAndNot);
            }

            return options;
          })
          .flat()
          .sort((a, b) => {
            if (a.logicGroup === b.logicGroup) return 0;
            return a.logicGroup === common.FractionLogicEnum.Or ? -1 : 1;
          }),
        controls: storeResultFirstTypeFraction.controls.map(control => {
          let newControl: common.FractionControl = {
            options: control.options,
            value: control.value,
            label: control.label,
            showIf: control.show_if,
            required: control.required,
            name: control.name,
            controlClass: control.controlClass,
            showIfDepsIncludingParentFilter:
              control.showIfDepsIncludingParentFilter
          };
          return newControl;
        })
      };
    } else {
      newFraction = {
        brick: 'any',
        operator: common.FractionOperatorEnum.Or,
        type: common.getFractionTypeForAny(filterExtended.field.result)
      };
    }

    let newFractions = [...fractions, newFraction];

    let newFilter = Object.assign({}, filterExtended, {
      fractions: newFractions
    });

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, filterIndex),
      newFilter,
      ...newMconfig.filters.slice(filterIndex + 1)
    ];

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  deleteFraction(
    filterExtended: common.FilterX,
    filterIndex: number,
    fractionIndex: number
  ) {
    let newMconfig = this.structService.makeMconfig();

    let fractions = filterExtended.fractions;

    if (fractions.length === 1) {
      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    } else {
      let newFractions = [
        ...fractions.slice(0, fractionIndex),
        ...fractions.slice(fractionIndex + 1)
      ];

      let newFilter = Object.assign({}, filterExtended, {
        fractions: newFractions
      });

      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        newFilter,
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    }

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }

  deleteFilter(filterExtended: common.FilterX) {
    let newMconfig = this.structService.makeMconfig();

    newMconfig.filters = newMconfig.filters.filter(
      x => x.fieldId !== filterExtended.fieldId
    );

    this.mconfigService.navCreateTempMconfigAndQuery(newMconfig);
  }
}
