import { Component } from '@angular/core';
import { AuthService } from '~front/app/services/auth.service';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-logo',
  templateUrl: 'logo.component.html'
})
export class LogoComponent {
  constructor(
    private navigateService: NavigateService,
    private auth: AuthService
  ) {}

  goTo() {}
}
