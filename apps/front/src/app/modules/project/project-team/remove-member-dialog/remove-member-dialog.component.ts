import { Component } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { map, take } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';

@Component({
  selector: 'm-remove-member-dialog',
  templateUrl: './remove-member-dialog.component.html'
})
export class RemoveMemberDialogComponent {
  constructor(public ref: DialogRef, private teamStore: TeamStore) {}

  remove() {
    this.ref.close();

    let payload: apiToBackend.ToBackendDeleteMemberRequestPayload = {
      projectId: this.ref.data.projectId,
      memberId: this.ref.data.memberId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteMember,
        payload
      )
      .pipe(
        map((resp: apiToBackend.ToBackendDeleteMemberResponse) => {
          this.teamStore.update(state => ({
            members: state.members.filter(
              x =>
                x.memberId !== this.ref.data.memberId ||
                x.projectId !== this.ref.data.projectId
            )
          }));
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
