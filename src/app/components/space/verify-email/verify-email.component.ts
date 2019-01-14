import { Component, OnInit } from '@angular/core';
import * as services from 'app/services/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { VerifyUserEmailAction } from '@app/store/actions/_index';
import { Router } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'm-verify-email',
  templateUrl: 'verify-email.component.html'
})
export class VerifyEmailComponent implements OnInit {
  private readonly LOGIN_URL: string = '/login';
  email: string;

  constructor(
    public pageTitle: services.PageTitleService,
    private store: Store<interfaces.AppState>,
    private router: Router,
    private watchAuthenticationService: services.WatchAuthenticationService
  ) {
    this.pageTitle.setTitle('Verify Email | Mprove');
  }

  ngOnInit() {
    this.watchAuthenticationService.start();

    this.store
      .select(selectors.getLayoutEmailToVerify)
      .pipe(take(1))
      .subscribe(x => (this.email = x));

    if (this.email !== undefined) {
      this.store.dispatch(
        new VerifyUserEmailAction({
          user_id: this.email,
          url: `${window.location.protocol}//${window.location.host}`
        })
      );
    } else {
      this.router.navigate([this.LOGIN_URL]);
    }
  }
}
