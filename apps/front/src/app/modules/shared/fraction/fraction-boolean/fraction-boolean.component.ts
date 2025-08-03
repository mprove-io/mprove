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
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { FractionTypeItem } from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-boolean',
  templateUrl: 'fraction-boolean.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionBooleanComponent {
  @ViewChild('fractionBooleanTypeSelect', { static: false })
  fractionBooleanTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionBooleanValueSelect', { static: false })
  fractionBooleanValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionBooleanTypeSelectElement?.close();
    this.fractionBooleanValueSelectElement?.close();
  }

  fractionOperatorEnum = common.FractionOperatorEnum;
  fractionTypeEnum = common.FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionBooleanTypesList: FractionTypeItem[] = [
    {
      operator: common.FractionOperatorEnum.And, // "And" isntead of "Or"
      label: 'is any value',
      value: common.FractionTypeEnum.BooleanIsAnyValue
    },
    {
      operator: common.FractionOperatorEnum.And,
      label: 'is true',
      value: common.FractionTypeEnum.BooleanIsTrue
    },
    {
      operator: common.FractionOperatorEnum.And,
      label: 'is false or null',
      value: common.FractionTypeEnum.BooleanIsFalseOrNull
    },
    {
      operator: common.FractionOperatorEnum.And,
      label: 'is false',
      value: common.FractionTypeEnum.BooleanIsFalse
    },
    {
      operator: common.FractionOperatorEnum.And,
      label: 'is null',
      value: common.FractionTypeEnum.BooleanIsNull
    },
    // {
    //   operator: common.FractionOperatorEnum.And,
    //   label: 'is not true',
    //   value: common.FractionTypeEnum.BooleanIsNotTrue // not supported (malloy issue)
    // },
    // {
    //   operator: common.FractionOperatorEnum.And,
    //   label: 'is not false or null',
    //   value: common.FractionTypeEnum.BooleanIsNotFalseOrNull // not supported (malloy issue)
    // },
    // {
    //   operator: common.FractionOperatorEnum.And,
    //   label: 'is not false',
    //   value: common.FractionTypeEnum.BooleanIsNotFalse // not supported (malloy issue)
    // },
    {
      operator: common.FractionOperatorEnum.And,
      label: 'is not null',
      value: common.FractionTypeEnum.BooleanIsNotNull
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
      case common.FractionTypeEnum.BooleanIsAnyValue: {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And, // "And" isntead of "Or"
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case common.FractionTypeEnum.BooleanIsTrue: {
        let mBrick = 'f`true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.BooleanIsFalse: {
        let mBrick = 'f`=false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.BooleanIsFalseOrNull: {
        let mBrick = 'f`false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.BooleanIsNull: {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.BooleanIsNotTrue: {
        let mBrick = 'f`not true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.BooleanIsNotFalse: {
        let mBrick = 'f`not =false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.BooleanIsNotFalseOrNull: {
        let mBrick = 'f`not false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case common.FractionTypeEnum.BooleanIsNotNull: {
        let mBrick = 'f`not null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      default: {
      }
    }
  }
}
