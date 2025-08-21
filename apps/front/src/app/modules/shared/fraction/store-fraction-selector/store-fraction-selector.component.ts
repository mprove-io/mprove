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
import { makeCopy } from '~common/functions/make-copy';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';

@Component({
  standalone: false,
  selector: 'm-store-fraction-selector',
  templateUrl: 'store-fraction-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
// implements OnInit
export class StoreFractionSelectorComponent {
  @ViewChild('fractionSelectorSelect', { static: false })
  fractionSelectorSelect: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionSelectorSelect?.close();
  }

  @Input() fraction: Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isDisabled: boolean;
  @Input() fractionControl: FractionControl;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  constructor(private fb: FormBuilder) {}

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  valueChange(item: { value: string; label: string }) {
    let newControl = makeCopy(this.fractionControl);

    newControl.value = item.value;

    let newFraction = makeCopy(this.fraction);

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
