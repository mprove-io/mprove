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
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { FractionYesnoValueEnum } from '~common/enums/fraction/fraction-yesno-value.enum';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
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
  @ViewChild('fractionYesnoTypeSelect', { static: false })
  fractionYesnoTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionYesnoValueSelect', { static: false })
  fractionYesnoValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionYesnoTypeSelectElement?.close();
    this.fractionYesnoValueSelectElement?.close();
  }

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionYesnoTypesList: FractionTypeItem[] = [
    {
      operator: FractionOperatorEnum.Or,
      label: 'is any value',
      value: FractionTypeEnum.YesnoIsAnyValue
    },
    {
      operator: FractionOperatorEnum.Or,
      label: 'is',
      value: FractionTypeEnum.YesnoIs
    }
  ];

  fractionYesnoValuesList: FractionYesnoValueItem[] = [
    {
      label: 'Yes',
      value: FractionYesnoValueEnum.Yes
    },
    {
      label: 'No',
      value: FractionYesnoValueEnum.No
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
      case FractionTypeEnum.YesnoIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case FractionTypeEnum.YesnoIs: {
        let newYesnoValue = FractionYesnoValueEnum.Yes;

        this.fraction = {
          brick: `${newYesnoValue.toLowerCase()}`,
          operator: FractionOperatorEnum.Or,
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
      type: FractionTypeEnum.YesnoIs,
      operator: FractionOperatorEnum.Or,
      yesnoValue: fractionYesnoValue,
      brick: `${fractionYesnoValue.toLowerCase()}`
    };

    this.emitFractionUpdate();
  }
}
