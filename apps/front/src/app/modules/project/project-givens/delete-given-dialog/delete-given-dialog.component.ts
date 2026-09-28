import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { Given } from '#common/zod/backend/given';
import type { ToBackendDeleteGivenRequest } from '#common/zod/backend/routes/givens/delete-given/delete-given-request';
import type { ToBackendDeleteGivenResponse } from '#common/zod/backend/routes/givens/delete-given/delete-given-response';
import { GivensQuery } from '#front/app/queries/givens.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { ApiService } from '#front/app/services/api.service';

export interface DeleteGivenDialogData {
  apiService: ApiService;
  given: Given;
}

@Component({
  selector: 'm-delete-given-dialog',
  templateUrl: './delete-given-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteGivenDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: DeleteGivenDialogData = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteGivenDialogData>,
    private memberQuery: MemberQuery,
    private givensQuery: GivensQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteGivenRequest['input'] = {
      projectId: this.dataItem.given.projectId,
      givenId: this.dataItem.given.givenId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendDeleteGiven',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteGivenResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);
            this.givensQuery.update({ givens: resp.output.givens });
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
