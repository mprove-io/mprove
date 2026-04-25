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
import { CodexDeviceAuthStatusEnum } from '#common/enums/codex-device-auth-status.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type {
  ToBackendPollUserCodexAuthRequestPayload,
  ToBackendPollUserCodexAuthResponse
} from '#common/zod/to-backend/users/to-backend-poll-user-codex-auth';
import type { ToBackendStartUserCodexAuthResponse } from '#common/zod/to-backend/users/to-backend-start-user-codex-auth';
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
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendStartUserCodexAuth,
        payload: {},
        showSpinner: false
      })
      .pipe(
        tap((resp: ToBackendStartUserCodexAuthResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.userCode = resp.payload.userCode;
            this.verificationUrl = resp.payload.verificationUrl;
            this.deviceAuthId = resp.payload.deviceAuthId;
            this.intervalSec = resp.payload.intervalSec;
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

          let payload: ToBackendPollUserCodexAuthRequestPayload = {
            deviceAuthId: this.deviceAuthId,
            userCode: this.userCode
          };

          return apiService.req({
            pathInfoName:
              ToBackendRequestInfoNameEnum.ToBackendPollUserCodexAuth,
            payload: payload,
            showSpinner: false
          });
        }),
        tap((resp: ToBackendPollUserCodexAuthResponse) => {
          if (!resp || resp.info?.status !== ResponseInfoStatusEnum.Ok) {
            return;
          }

          let status = resp.payload.status;

          if (status === CodexDeviceAuthStatusEnum.Authorized) {
            this.pollSub?.unsubscribe();
            if (resp.payload.user) {
              this.userQuery.update(resp.payload.user);
            }
            this.ref.close();
          } else if (status === CodexDeviceAuthStatusEnum.Failed) {
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
