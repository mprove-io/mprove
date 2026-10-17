import { Component } from '@angular/core';
import { SpinnerService } from '#front/app/services/spinner.service';

@Component({
  standalone: false,
  selector: 'm-select-file',
  templateUrl: './select-file.component.html'
})
export class SelectFileComponent {
  constructor(public spinnerService: SpinnerService) {}
}
