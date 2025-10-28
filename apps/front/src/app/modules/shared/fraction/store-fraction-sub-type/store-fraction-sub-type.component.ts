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
import { TRIPLE_UNDERSCORE } from '~common/constants/top';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { FractionLogicEnum } from '~common/enums/fraction/fraction-logic.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { FractionSubTypeOption } from '~common/interfaces/blockml/fraction-sub-type-option';
import { FileStore } from '~common/interfaces/blockml/internal/file-store';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';

@Component({
  standalone: false,
  selector: 'm-store-fraction-sub-type',
  templateUrl: 'store-fraction-sub-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
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
  @Input() storeContent: FileStore;
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
    let storeTypeFraction = this.storeContent.results
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
      controls: this.storeContent.results
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
      brick: undefined as any,
      parentBrick: undefined as any
    };

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }
}
