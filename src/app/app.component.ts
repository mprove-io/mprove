import { Component, ViewEncapsulation } from '@angular/core';
import { LoadingMode, LoadingType, TdLoadingService } from '@covalent/core';
import * as enums from 'src/app/enums/_index';
import * as services from 'src/app/services/_index';

@Component({
  selector: 'm-app',
  styleUrls: ['app.component.scss'],
  templateUrl: 'app.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  constructor(
    private printer: services.PrinterService,
    private loadingService: TdLoadingService) {

    this.loadingService.create({
      name: 'app',
      type: LoadingType.Circular,
      mode: LoadingMode.Indeterminate,
      // color: 'accent',
    });
  }

  activateEvent(event: any) {
    this.printer.log(enums.busEnum.ACTIVATE_EVENT, 'from AppComponent:', event);
  }

  deactivateEvent(event: any) {
    this.printer.log(enums.busEnum.DEACTIVATE_EVENT, 'from AppComponent:', event);
  }
}
