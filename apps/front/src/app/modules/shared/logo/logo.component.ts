import { Component } from '@angular/core';
import { AuthService } from '~front/app/services/auth.service';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  selector: 'm-logo',
  templateUrl: 'logo.component.html'
})
export class LogoComponent {
  constructor(
    public navigateService: NavigateService,
    private auth: AuthService
  ) {}

  goTo() {
    if (this.auth.authenticated()) {
      this.navigateService.navigateToProdMasterVizs();
    } else {
      window.open('https://mprove.io');
    }
  }
}
