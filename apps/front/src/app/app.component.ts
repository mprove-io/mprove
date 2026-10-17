import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { AuthService } from './services/auth.service';
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  imports: [RouterModule, NgxSpinnerModule, CommonModule],
  standalone: true
})
export class AppComponent implements OnInit {
  appSpinnerName = APP_SPINNER_NAME;

  constructor(
    private authService: AuthService,
    // Eagerly initialize global spinner navigation tracking.
    private spinnerService: SpinnerService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.authService.runCheck();
    }, 0); // setTimeout is for runCheck's this.location.path to have '/'
  }
}
