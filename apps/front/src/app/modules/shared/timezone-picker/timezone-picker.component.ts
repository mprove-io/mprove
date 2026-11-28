import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import {
  getTimezones,
  type TimezoneOption
} from '#common/functions/get-timezones/get-timezones';
import { SearchablePickerComponent } from '../searchable-picker/searchable-picker.component';

@Component({
  selector: 'm-timezone-picker',
  imports: [SearchablePickerComponent],
  templateUrl: './timezone-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimezonePickerComponent {
  readonly value = input.required<string>();
  readonly isDisabled = input.required<boolean>();
  readonly testId = input.required<string>();
  readonly timezoneChange = output<string>();

  readonly timezones: TimezoneOption[] = getTimezones();
}
