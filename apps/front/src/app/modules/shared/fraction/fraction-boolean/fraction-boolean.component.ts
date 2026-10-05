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
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import { FractionTypeItem } from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-boolean',
  templateUrl: 'fraction-boolean.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionBooleanComponent {
  readonly fractionOperatorAnd: FractionOperator = 'And';

  @ViewChild('fractionBooleanTypeSelect', { static: false })
  fractionBooleanTypeSelectElement: NgSelectComponent;

  @ViewChild('fractionBooleanValueSelect', { static: false })
  fractionBooleanValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionBooleanTypeSelectElement?.close();
    this.fractionBooleanValueSelectElement?.close();
  }

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionBooleanTypesList: FractionTypeItem[] = [
    {
      operator: 'And', // "And" isntead of "Or"
      label: 'is any value',
      value: 'BooleanIsAnyValue'
    },
    {
      operator: 'And',
      label: 'is =true',
      value: 'BooleanIsTrue'
    },
    {
      operator: 'And',
      label: 'is true',
      value: 'BooleanIsTruthy'
    },
    {
      operator: 'And',
      label: 'is =false',
      value: 'BooleanIsFalse'
    },
    {
      operator: 'And',
      label: 'is false',
      value: 'BooleanIsFalsy'
    },
    {
      operator: 'And',
      label: 'is null',
      value: 'BooleanIsNull'
    },
    {
      operator: 'And',
      label: 'is not =true',
      value: 'BooleanIsNotTrue'
    },
    {
      operator: 'And',
      label: 'is not true',
      value: 'BooleanIsNotTruthy'
    },
    {
      operator: 'And',
      label: 'is not =false',
      value: 'BooleanIsNotFalse'
    },
    {
      operator: 'And',
      label: 'is not false',
      value: 'BooleanIsNotFalsy'
    },
    {
      operator: 'And',
      label: 'is not null',
      value: 'BooleanIsNotNull'
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
      case 'BooleanIsAnyValue': {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And', // "And" isntead of "Or"
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'BooleanIsTrue': {
        let mBrick = 'f`=true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsTruthy': {
        let mBrick = 'f`true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsFalse': {
        let mBrick = 'f`=false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsFalsy': {
        let mBrick = 'f`false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsNull': {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsNotTrue': {
        let mBrick = 'f`not =true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsNotTruthy': {
        let mBrick = 'f`not true`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsNotFalse': {
        let mBrick = 'f`not =false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsNotFalsy': {
        let mBrick = 'f`not false`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();

        break;
      }

      case 'BooleanIsNotNull': {
        let mBrick = 'f`not null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
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
