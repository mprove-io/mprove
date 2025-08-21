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

@Component({
  standalone: false,
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

  @Input() fraction: Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isDisabled: boolean;
  @Input() modelContent: any;
  @Input() fieldResult: FieldResultEnum | string;
  @Input() fractionControl: FractionControl;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  logicGroupEnumOr = FractionLogicEnum.Or;
  logicGroupEnumAndNot = FractionLogicEnum.AndNot;

  constructor(private fb: FormBuilder) {}

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  subTypeChange(item: FractionSubTypeOption) {
    let storeTypeFraction = (this.modelContent as FileStore).results
      .find(r => r.result === this.fieldResult)
      .fraction_types.find(ft => ft.type === item.typeValue);

    let newFraction: Fraction = {
      meta: storeTypeFraction.meta,
      operator:
        item.logicGroup === FractionLogicEnum.Or
          ? FractionOperatorEnum.Or
          : FractionOperatorEnum.And,
      logicGroup: item.logicGroup,
      type: FractionTypeEnum.StoreFraction,
      storeFractionSubType: item.typeValue,
      storeFractionSubTypeOptions: this.fraction.storeFractionSubTypeOptions,
      storeFractionSubTypeLabel: isDefined(item.typeValue)
        ? this.fraction.storeFractionSubTypeOptions.find(
            k => k.typeValue === item.typeValue
          ).label
        : item.typeValue,
      storeFractionLogicGroupWithSubType: `${item.logicGroup}${TRIPLE_UNDERSCORE}${item.typeValue}`,
      controls: (this.modelContent as FileStore).results
        .find(r => r.result === this.fieldResult)
        .fraction_types.find(ft => ft.type === item.typeValue)
        .controls.map(control => {
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
        }),
      brick: undefined as any
    };

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }
}
