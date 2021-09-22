import { Component } from '@angular/core';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  selector: 'm-logo',
  templateUrl: 'logo.component.html'
})
export class LogoComponent {
  constructor(public navigateService: NavigateService) {}

  goToVizs() {
    this.navigateService.navigateToProdMasterVizs();
  }
}
