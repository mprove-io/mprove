import { Component, OnInit } from '@angular/core';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Component({
  moduleId: module.id,
  selector: 'm-reset-password-sent',
  templateUrl: 'reset-password-sent.component.html'
})
export class ResetPasswordSentComponent implements OnInit {
  email: string;

  constructor(
    public pageTitle: services.PageTitleService,
    private store: Store<interfaces.AppState>,
    private watchAuthenticationService: services.WatchAuthenticationService
  ) {
    this.pageTitle.setTitle('Reset Password Sent | Mprove');
  }

  ngOnInit() {
    this.watchAuthenticationService.start();

    this.store
      .select(selectors.getLayoutEmailToResetPassword)
      .pipe(take(1))
      .subscribe(x => (this.email = x));
  }
}
