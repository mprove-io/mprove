import { Component, ViewEncapsulation } from '@angular/core';
import { LoadingMode, LoadingType, TdLoadingService } from '@covalent/core';
import * as enums from '@app/enums/_index';
import * as services from '@app/services/_index';

@Component({
  selector: 'm-app',
  styleUrls: ['app.component.scss'],
  templateUrl: 'app.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  constructor(
    private printer: services.PrinterService,
    private loadingService: TdLoadingService
  ) {
    this.loadingService.create({
      name: 'app',
      type: LoadingType.Circular,
      mode: LoadingMode.Indeterminate
    });
  }
}
