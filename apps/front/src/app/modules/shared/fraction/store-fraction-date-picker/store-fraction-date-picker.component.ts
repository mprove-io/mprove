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
import { COMMON_I18N } from '~front/app/constants/top';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  standalone: false,
  selector: 'm-store-fraction-date-picker',
  templateUrl: 'store-fraction-date-picker.component.html',
  styleUrls: ['store-fraction-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
// implements OnInit
export class StoreFractionDatePickerComponent {
  @Input() metricsStartDateYYYYMMDD: string;
  @Input() metricsEndDateYYYYMMDD: string;
  @Input() fraction: common.Fraction;
  @Input() isFirst: boolean;
  @Input() fractionIndex: number;
  @Input() isMetricsPage: boolean;
  @Input() isDisabled: boolean;
  @Input() fractionControl: common.FractionControl;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

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
      common.isDefinedAndNotEmpty(vDatePicker?.value) &&
      common.isDefined(this.fractionControl) &&
      common.isDefined(this.fraction)
    ) {
      console.log('x');
      console.log(x);

      console.log('this.fractionControl');
      console.log(this.fractionControl);

      let value = vDatePicker.value;

      let newControl = common.makeCopy(this.fractionControl);

      newControl.value = value;

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
}
