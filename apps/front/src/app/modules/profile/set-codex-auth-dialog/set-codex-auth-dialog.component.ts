import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { interval, of, Subscription } from 'rxjs';
import { concatMap, take, tap } from 'rxjs/operators';

import type { ToBackendPollUserCodexAuthRequest } from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-request';
import type { ToBackendPollUserCodexAuthResponse } from '#common/types/backend/routes/users/poll-user-codex-auth/poll-user-codex-auth-response';
import type { ToBackendStartUserCodexAuthResponse } from '#common/types/backend/routes/users/start-user-codex-auth/start-user-codex-auth-response';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';

export interface SetCodexAuthDialogData {
  apiService: ApiService;
}

const POLL_SAFETY_MARGIN_MS = 3000;

@Component({
  selector: 'm-set-codex-auth-dialog',
  templateUrl: './set-codex-auth-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, NgxSpinnerModule]
})
export class SetCodexAuthDialogComponent implements OnInit, OnDestroy {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.close();
  }

  userCode: string;
  verificationUrl: string;
  deviceAuthId: string;
  intervalSec: number;

  copiedCode = false;
  errorMessage: string;

  spinnerName = 'setCodexAuthDialogSpinner';

  private pollSub: Subscription;

  constructor(
    public ref: DialogRef<SetCodexAuthDialogData>,
    private userQuery: UserQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.start();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  ngOnDestroy() {
    this.pollSub?.unsubscribe();
  }

  start() {
    this.errorMessage = undefined;
    this.spinner.show(this.spinnerName);
    this.cd.detectChanges();

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        route: 'api/ToBackendStartUserCodexAuth',
        payload: {},
        showSpinner: false
      })
      .pipe(
        tap((resp: ToBackendStartUserCodexAuthResponse) => {
          if (resp?.type === 'Success') {
            this.userCode = resp.output.userCode;
            this.verificationUrl = resp.output.verificationUrl;
            this.deviceAuthId = resp.output.deviceAuthId;
            this.intervalSec = resp.output.intervalSec;
            this.spinner.hide(this.spinnerName);
            this.cd.detectChanges();
            this.startPolling();
          } else {
            this.errorMessage = 'Failed to start authorization. Try again.';
            this.spinner.hide(this.spinnerName);
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  private startPolling() {
    this.pollSub?.unsubscribe();

    let apiService: ApiService = this.ref.data.apiService;
    let pollIntervalMs = (this.intervalSec ?? 5) * 1000 + POLL_SAFETY_MARGIN_MS;

    this.pollSub = interval(pollIntervalMs)
      .pipe(
        concatMap(() => {
          if (!this.deviceAuthId || !this.userCode) {
            return of(undefined);
          }

          let payload: ToBackendPollUserCodexAuthRequest['input'] = {
            deviceAuthId: this.deviceAuthId,
            userCode: this.userCode
          };

          return apiService.req({
            route: 'api/ToBackendPollUserCodexAuth',
            payload: payload,
            showSpinner: false
          });
        }),
        tap((resp: ToBackendPollUserCodexAuthResponse) => {
          if (!resp || resp?.type !== 'Success') {
            return;
          }

          let status = resp.output.status;

          if (status === 'Authorized') {
            this.pollSub?.unsubscribe();
            if (resp.output.user) {
              this.userQuery.update(resp.output.user);
            }
            this.ref.close();
          } else if (status === 'Failed') {
            this.pollSub?.unsubscribe();
            this.errorMessage =
              'Authorization failed. Generate a new code and try again.';
            this.cd.detectChanges();
          }
        })
      )
      .subscribe();
  }

  copyCode() {
    if (!this.userCode) {
      return;
    }
    navigator.clipboard.writeText(this.userCode).then(() => {
      this.copiedCode = true;
      this.cd.detectChanges();
    });
  }

  retry() {
    this.userCode = undefined;
    this.verificationUrl = undefined;
    this.deviceAuthId = undefined;
    this.intervalSec = undefined;
    this.copiedCode = false;
    this.start();
  }

  close() {
    this.pollSub?.unsubscribe();
    this.ref.close();
  }
}
