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

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionBooleanTypesList: FractionTypeItem[] = [
    {
      operator: FractionOperatorEnum.And, // "And" isntead of "Or"
      label: 'is any value',
      value: FractionTypeEnum.BooleanIsAnyValue
    },
    {
      operator: FractionOperatorEnum.And,
      label: 'is true',
      value: FractionTypeEnum.BooleanIsTrue
    },
    {
      operator: FractionOperatorEnum.And,
      label: 'is false or null',
      value: FractionTypeEnum.BooleanIsFalseOrNull
    },
    {
      operator: FractionOperatorEnum.And,
      label: 'is false',
      value: FractionTypeEnum.BooleanIsFalse
    },
    {
      operator: FractionOperatorEnum.And,
      label: 'is null',
      value: FractionTypeEnum.BooleanIsNull
    },
    // {
    //   operator: FractionOperatorEnum.And,
    //   label: 'is not true',
    //   value: FractionTypeEnum.BooleanIsNotTrue // not supported (malloy issue)
    // },
    // {
    //   operator: FractionOperatorEnum.And,
    //   label: 'is not false or null',
    //   value: FractionTypeEnum.BooleanIsNotFalseOrNull // not supported (malloy issue)
    // },
    // {
    //   operator: FractionOperatorEnum.And,
    //   label: 'is not false',
    //   value: FractionTypeEnum.BooleanIsNotFalse // not supported (malloy issue)
    // },
    {
      operator: FractionOperatorEnum.And,
      label: 'is not null',
      value: FractionTypeEnum.BooleanIsNotNull
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
      case FractionTypeEnum.BooleanIsAnyValue: {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `any`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And, // "And" isntead of "Or"
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case FractionTypeEnum.BooleanIsTrue: {
        let mBrick = 'f`true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.BooleanIsFalse: {
        let mBrick = 'f`=false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.BooleanIsFalseOrNull: {
        let mBrick = 'f`false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.BooleanIsNull: {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.BooleanIsNotTrue: {
        let mBrick = 'f`not true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.BooleanIsNotFalse: {
        let mBrick = 'f`not =false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.BooleanIsNotFalseOrNull: {
        let mBrick = 'f`not false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case FractionTypeEnum.BooleanIsNotNull: {
        let mBrick = 'f`not null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: FractionOperatorEnum.And,
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
