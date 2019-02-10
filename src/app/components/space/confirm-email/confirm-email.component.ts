import { Component, OnInit } from '@angular/core';
import * as services from '@app/services/_index';
import * as interfaces from '@app/interfaces/_index';
import { Store } from '@ngrx/store';
import * as actions from '@app/store-actions/_index';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  moduleId: module.id,
  selector: 'm-confirm-email',
  templateUrl: 'confirm-email.component.html'
})
export class ConfirmEmailComponent implements OnInit {
  token;

  constructor(
    public pageTitle: services.PageTitleService,
    private store: Store<interfaces.AppState>,
    private route: ActivatedRoute
  ) {
    this.pageTitle.setTitle('Confirm Email | Mprove');
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.store.dispatch(
      new actions.ConfirmUserEmailAction({ token: this.token })
    );
    this.store.dispatch(new actions.LogoutUserAction({ empty: true }));
  }
}
