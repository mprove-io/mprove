import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { take, tap } from 'rxjs/operators';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { ToBackendGetMemberGivensOutput } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-output';
import type { ToBackendGetMemberGivensRequest } from '#common/types/backend/routes/members/get-member-givens/get-member-givens-request';
import { ApiService } from '#front/app/services/api.service';
import { AppSpinnerService } from '#front/app/services/app-spinner.service';

export interface GetMemberGivensDialogData {
  apiService: ApiService;
  projectId: string;
  memberId: string;
  email: string;
}

@Component({
  selector: 'm-get-member-givens-dialog',
  templateUrl: './get-member-givens-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, NgScrollbarModule]
})
export class GetMemberGivensDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  memberGivens: MemberGiven[] = [];

  constructor(
    private appSpinnerService: AppSpinnerService,
    public ref: DialogRef<GetMemberGivensDialogData>,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let payload: ToBackendGetMemberGivensRequest['input'] = {
      projectId: this.ref.data.projectId,
      memberId: this.ref.data.memberId
    };

    this.ref.data.apiService
      .req({
        route: 'api/ToBackendGetMemberGivens',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendGetMemberGivensOutput = resp.output;

          this.memberGivens = output.memberGivens;
          this.cd.detectChanges();
        }),
        take(1),
        this.appSpinnerService.track()
      )
      .subscribe();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  close() {
    this.ref.close();
  }
}
