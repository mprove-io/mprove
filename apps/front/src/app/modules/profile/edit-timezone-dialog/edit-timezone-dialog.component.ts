import { ChangeDetectorRef, Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { UserStore } from '~front/app/stores/user.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface EditTimezoneDialogItem {
  apiService: ApiService;
}

@Component({
  selector: 'm-edit-timezone-dialog',
  templateUrl: './edit-timezone-dialog.component.html'
})
export class EditTimezoneDialogComponent {
  timezone: string;

  timezones = common.getTimezones();

  timezone$ = this.userQuery.timezone$.pipe(
    tap(x => {
      this.timezone = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<EditTimezoneDialogItem>,
    private userStore: UserStore,
    private userQuery: UserQuery,
    private cd: ChangeDetectorRef
  ) {}

  save() {
    this.ref.close();

    let payload: apiToBackend.ToBackendSetUserTimezoneRequestPayload = {
      timezone: this.timezone
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserTimezone,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendSetUserTimezoneResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            this.userStore.update(user);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
