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
import type { MemberGiven } from '#common/zod/backend/members/member-given';
import type { ToBackendGetMemberGivensInput } from '#common/zod/backend/routes/members/get-member-givens/get-member-givens-request';
import type { ToBackendGetMemberGivensResponse } from '#common/zod/backend/routes/members/get-member-givens/get-member-givens-response';
import { ApiService } from '#front/app/services/api.service';

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
    public ref: DialogRef<GetMemberGivensDialogData>,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    let payload: ToBackendGetMemberGivensInput = {
      projectId: this.ref.data.projectId,
      memberId: this.ref.data.memberId
    };

    this.ref.data.apiService
      .req({
        route: 'api/ToBackendGetMemberGivens',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendGetMemberGivensResponse) => {
          if (resp.result?.type === 'Success') {
            this.memberGivens = resp.result.value.memberGivens;
            this.cd.detectChanges();
          }
        }),
        take(1)
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
