import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export interface DeleteRepDialogData {
  apiService: ApiService;
  repDeletedFnBindThis: any;
  rep: common.RepX;
  projectId: string;
  branchId: string;
  envId: string;
  isRepoProd: boolean;
  isStartSpinnerUntilNavEnd: boolean;
}

@Component({
  selector: 'm-delete-rep-dialog',
  templateUrl: './delete-rep-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteRepDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteRepDialogData>,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    if (this.ref.data.isStartSpinnerUntilNavEnd === true) {
      this.spinner.show(constants.APP_SPINNER_NAME);
    }

    this.ref.close();

    let { projectId, branchId, isRepoProd } = this.ref.data;

    let rep: common.RepX = this.ref.data.rep;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendDeleteRepRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      repId: rep.repId
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRep,
        payload: payload,
        showSpinner: !this.ref.data.isStartSpinnerUntilNavEnd
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteRepResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.ref.data.repDeletedFnBindThis(rep.repId);
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
