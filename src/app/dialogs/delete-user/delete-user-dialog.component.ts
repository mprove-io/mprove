import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import { filter, take, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-delete-user-dialog',
  templateUrl: 'delete-user-dialog.component.html'
})
export class DeleteUserDialogComponent {
  userId$ = this.store.select(selectors.getUserId).pipe(filter(v => !!v));

  constructor(
    public dialogRef: MatDialogRef<DeleteUserDialogComponent>,
    private store: Store<interfaces.AppState>
  ) {}

  onSubmit() {
    let user: api.User;

    this.store
      .select(selectors.getUserState)
      .pipe(take(1))
      .subscribe(x => (user = x));

    this.store.dispatch(
      new actions.DeleteUserAction({
        user_id: user.user_id,
        server_ts: user.server_ts
      })
    );
  }
}
