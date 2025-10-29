import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DatePicker } from '@vaadin/date-picker';
import { COMMON_I18N } from '~common/constants/top-front';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { makeCopy } from '~common/functions/make-copy';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { FractionControl } from '~common/interfaces/blockml/fraction-control';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';

@Component({
  standalone: false,
  selector: 'm-store-fraction-date-picker',
  templateUrl: 'store-fraction-date-picker.component.html',
  styleUrls: ['store-fraction-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreFractionDatePickerComponent {
  @Input() metricsStartDateYYYYMMDD: string;
  @Input() metricsEndDateYYYYMMDD: string;
  @Input() fraction: Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isMetricsPage: boolean;
  @Input() isDisabled: boolean;
  @Input() fractionControl: FractionControl;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  @ViewChild('vDatePicker') vDatePicker: ElementRef<DatePicker>;

  dateI18n = Object.assign({}, COMMON_I18N);

  constructor(private fb: FormBuilder) {}

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  dateValueChanged(x: any) {
    let vDatePicker = this.vDatePicker?.nativeElement;

    if (
      isDefinedAndNotEmpty(vDatePicker?.value) &&
      isDefined(this.fractionControl) &&
      isDefined(this.fraction)
    ) {
      let value = vDatePicker.value;

      let newControl = makeCopy(this.fractionControl);

      newControl.value = value;

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
}
