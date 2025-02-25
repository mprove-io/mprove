import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  selector: 'm-store-fraction-sub-type',
  templateUrl: 'store-fraction-sub-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
// implements OnInit
export class StoreFractionSubTypeComponent {
  @ViewChild('fractionSubTypeSelect', { static: false })
  fractionSubTypeSelect: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionSubTypeSelect?.close();
  }

  @Input() fraction: common.Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isDisabled: boolean;
  @Input() modelContent: any;
  @Input() fieldResult: common.FieldResultEnum;
  @Input() fractionControl: common.FractionControl;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  logicGroupEnumOr = common.FractionLogicEnum.Or;
  logicGroupEnumAndNot = common.FractionLogicEnum.AndNot;

  constructor(private fb: FormBuilder) {}

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  subTypeChange(item: common.FractionSubTypeOption) {
    let storeTypeFraction = (this.modelContent as common.FileStore).results
      .find(r => r.result === this.fieldResult)
      .fraction_types.find(ft => ft.type === item.typeValue);

    let newFraction: common.Fraction = {
      meta: storeTypeFraction.meta,
      operator:
        item.logicGroup === common.FractionLogicEnum.Or
          ? common.FractionOperatorEnum.Or
          : common.FractionOperatorEnum.And,
      logicGroup: item.logicGroup,
      type: common.FractionTypeEnum.StoreFraction,
      storeFractionSubType: item.typeValue,
      storeFractionLogicGroupWithSubType: item.logicGroup + item.typeValue,
      storeFractionSubTypeOptions: this.fraction.storeFractionSubTypeOptions,
      controls: (this.modelContent as common.FileStore).results
        .find(r => r.result === this.fieldResult)
        .fraction_types.find(ft => ft.type === item.typeValue)
        .controls.map(control => {
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
        }),
      brick: undefined as any
    };

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }
}
