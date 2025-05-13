import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  standalone: false,
  selector: 'm-store-fraction-switch',
  templateUrl: 'store-fraction-switch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
// implements OnInit
export class StoreFractionSwitchComponent {
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

  toggleSwitch() {
    let newControl = common.makeCopy(this.fractionControl);

    newControl.value = !newControl.value;

    let newFraction = common.makeCopy(this.fraction);

    let controlIndex = newFraction.controls.findIndex(
      control => control.name === this.fractionControl.name
    );

    newFraction.controls = [
      ...newFraction.controls.slice(0, controlIndex),
      newControl,
      ...newFraction.controls.slice(controlIndex + 1)
    ];

    this.fraction = newFraction;

    this.emitFractionUpdate();
  }
}
