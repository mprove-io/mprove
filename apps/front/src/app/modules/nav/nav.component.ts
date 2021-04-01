import { Component } from '@angular/core';
import { AuthService } from '~front/app/services/auth.service';

@Component({
  selector: 'mprove-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent {
  constructor(private authService: AuthService) {}

  isAuthenticated() {
    return this.authService.authenticated();
  }
}
