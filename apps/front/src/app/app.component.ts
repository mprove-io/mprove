import { Component, type OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'm-root',
  templateUrl: './app.component.html',
  imports: [RouterModule],
  standalone: true
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    protected readonly spinnerService: SpinnerService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.authService.runCheck();
    }, 0); // setTimeout is for runCheck's this.location.path to have '/'
  }
}
