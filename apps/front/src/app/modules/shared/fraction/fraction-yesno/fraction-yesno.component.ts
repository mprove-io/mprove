import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import {
  FractionTypeItem,
  FractionYesnoValueItem
} from '../fraction.component';

@Component({
  selector: 'm-fraction-yesno',
  templateUrl: 'fraction-yesno.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionYesnoComponent implements OnInit {
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionForm: FormGroup;

  fractionYesnoTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.YesnoIsAnyValue
    },
    {
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

  ngOnInit() {
    this.buildFractionForm();
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      yesnoValue: [this.fraction.yesnoValue]
    });
  }

  updateControlFractionFormYesnoValueFromFraction() {
    this.fractionForm.controls['yesnoValue'].setValue(this.fraction.yesnoValue);
  }

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

        this.updateControlFractionFormYesnoValueFromFraction();
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
