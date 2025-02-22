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

@Component({
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

  @Input() fraction: common.Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isDisabled: boolean;
  @Input() fractionControl: common.FractionControl;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  constructor(private fb: FormBuilder) {}

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  subTypeChange(item: { type: string; label: string }) {
    let newFraction: common.Fraction = {
      type: common.FractionTypeEnum.StoreFraction,
      storeFractionSubType: item.type,
      controls: [] as any[],
      brick: undefined as any,
      operator: undefined as any
    };

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }
}
