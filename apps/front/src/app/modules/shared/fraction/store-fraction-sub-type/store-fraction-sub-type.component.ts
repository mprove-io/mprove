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

  subTypeChange(item: { value: string; label: string }) {
    let newFraction: common.Fraction = {
      type: common.FractionTypeEnum.StoreFraction,
      storeFractionSubType: item.value,
      storeFractionSubTypeOptions: this.fraction.storeFractionSubTypeOptions,
      controls: (this.modelContent as common.FileStore).results
        .find(r => r.result === this.fieldResult)
        .fraction_types.find(ft => ft.type === item.value)
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
      brick: undefined as any,
      operator: undefined as any
    };

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }
}
