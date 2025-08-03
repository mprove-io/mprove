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

  fractionOperatorEnum = common.FractionOperatorEnum;
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionYesnoTypesList: FractionTypeItem[] = [
    {
      operator: common.FractionOperatorEnum.Or,
      label: 'is any value',
      value: common.FractionTypeEnum.YesnoIsAnyValue
    },
    {
      operator: common.FractionOperatorEnum.Or,
      label: 'is',
      value: common.FractionTypeEnum.YesnoIs
    }
  ];

  fractionYesnoValuesList: FractionYesnoValueItem[] = [
    {
      label: 'Yes',
      value: common.FractionYesnoValueEnum.Yes
    },
    {
      label: 'No',
      value: common.FractionYesnoValueEnum.No
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
      case common.FractionTypeEnum.YesnoIsAnyValue: {
        this.fraction = {
          brick: `any`,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case common.FractionTypeEnum.YesnoIs: {
        let newYesnoValue = common.FractionYesnoValueEnum.Yes;

        this.fraction = {
          brick: `${newYesnoValue.toLowerCase()}`,
          operator: common.FractionOperatorEnum.Or,
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
      type: common.FractionTypeEnum.YesnoIs,
      operator: common.FractionOperatorEnum.Or,
      yesnoValue: fractionYesnoValue,
      brick: `${fractionYesnoValue.toLowerCase()}`
    };

    this.emitFractionUpdate();
  }
}
