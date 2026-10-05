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
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import type { FractionYesnoValue } from '#common/types/blockml/parts/fraction/fraction-yesno-value';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import {
  FractionTypeItem,
  FractionYesnoValueItem
} from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-yesno',
  templateUrl: 'fraction-yesno.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionYesnoComponent {
  readonly fractionOperatorAnd: FractionOperator = 'And';

  @ViewChild('fractionYesnoTypeSelect', { static: false })
  fractionYesnoTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionYesnoValueSelect', { static: false })
  fractionYesnoValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionYesnoTypeSelectElement?.close();
    this.fractionYesnoValueSelectElement?.close();
  }

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionYesnoTypesList: FractionTypeItem[] = [
    {
      operator: 'Or',
      label: 'is any value',
      value: 'YesnoIsAnyValue'
    },
    {
      operator: 'Or',
      label: 'is',
      value: 'YesnoIs'
    }
  ];

  fractionYesnoValuesList: FractionYesnoValueItem[] = [
    {
      label: 'Yes',
      value: 'Yes'
    },
    {
      label: 'No',
      value: 'No'
    }
  ];

  constructor(private fb: FormBuilder) {}

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case 'YesnoIsAnyValue': {
        this.fraction = {
          brick: `any`,
          parentBrick: `any`,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'YesnoIs': {
        let newYesnoValue: FractionYesnoValue = 'Yes';

        this.fraction = {
          brick: `${newYesnoValue.toLowerCase()}`,
          parentBrick: `${newYesnoValue.toLowerCase()}`,
          operator: 'Or',
          type: fractionType,
          yesnoValue: newYesnoValue
        };

        this.emitFractionUpdate();

        break;
      }

      default: {
      }
    }
  }

  yesnoChange(fractionYesnoValueItem: FractionYesnoValueItem) {
    let fractionYesnoValue = fractionYesnoValueItem.value;

    this.fraction = {
      type: 'YesnoIs',
      operator: 'Or',
      yesnoValue: fractionYesnoValue,
      brick: `${fractionYesnoValue.toLowerCase()}`,
      parentBrick: `${fractionYesnoValue.toLowerCase()}`
    };

    this.emitFractionUpdate();
  }
}
