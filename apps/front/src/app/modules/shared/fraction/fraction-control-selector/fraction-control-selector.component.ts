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
  selector: 'm-fraction-control-selector',
  templateUrl: 'fraction-control-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
// implements OnInit
export class FractionControlSelectorComponent {
  @ViewChild('fractionControlSelectorSelect', { static: false })
  fractionControlSelectorSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionControlSelectorSelectElement?.close();
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

  valueChange(item: { value: string; label: string }) {
    let newControl = common.makeCopy(this.fractionControl);

    newControl.value = item.value;

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
