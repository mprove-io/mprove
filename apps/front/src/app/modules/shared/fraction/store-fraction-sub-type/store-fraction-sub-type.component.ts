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
import { TRIPLE_UNDERSCORE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FieldResult } from '#common/types/blockml/parts/field/field-result';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionControl } from '#common/types/blockml/parts/fraction/fraction-control';
import type { FractionSubTypeOption } from '#common/types/blockml/parts/fraction/fraction-sub-type-option';
import type { FileStore } from '#common/types/blockml/parts/internal/file-store';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';

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
  @Input() fieldResult: FieldResult | string;
  @Input() fractionControl: FractionControl;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

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
      operator: item.logicGroup === 'OR' ? 'Or' : 'And',
      logicGroup: item.logicGroup,
      type: 'StoreFraction',
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
