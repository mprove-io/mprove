import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface EditUserTimezoneDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-edit-user-timezone-dialog',
  templateUrl: './edit-user-timezone-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class EditUserTimezoneDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  timezone: string;

  timezones = common.getUserTimezones();

  timezone$ = this.userQuery.timezone$.pipe(
    tap(x => {
      this.timezone = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<EditUserTimezoneDialogData>,
    private userQuery: UserQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    this.ref.close();

    let payload: apiToBackend.ToBackendSetUserTimezoneRequestPayload = {
      timezone: this.timezone
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetUserTimezone,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendSetUserTimezoneResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let user = resp.payload.user;
            this.userQuery.update(user);
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
