import { Component } from '@angular/core';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';

@Component({
  standalone: false,
  selector: 'm-select-file',
  templateUrl: './select-file.component.html'
})
export class SelectFileComponent {
  constructor(public appSpinnerService: AppSpinnerService) {}
}
