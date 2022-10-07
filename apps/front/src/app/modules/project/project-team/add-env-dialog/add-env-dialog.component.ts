import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { map, take, tap } from 'rxjs/operators';
import { ApiService } from '~front/app/services/api.service';
import { TeamState, TeamStore } from '~front/app/stores/team.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface AddEnvDialogDataItem {
  apiService: ApiService;
  member: common.Member;
  i: number;
}

@Component({
  selector: 'm-add-env-dialog',
  templateUrl: './add-env-dialog.component.html'
})
export class AddEnvDialogComponent implements OnInit {
  addEnvForm: FormGroup;

  member = this.ref.data.member;

  envsList: common.EnvsItem[] = [];
  envsListLoading = false;
  envsListLength = 0;

  projectId: string;

  constructor(
    public ref: DialogRef<AddEnvDialogDataItem>,
    private fb: FormBuilder,
    private teamStore: TeamStore
  ) {}

  ngOnInit() {
    this.addEnvForm = this.fb.group({
      envId: ['', [Validators.required, Validators.maxLength(255)]]
    });
  }

  openEnvSelect() {
    this.envsListLoading = true;

    let member: common.Member = this.ref.data.member;

    let apiService: ApiService = this.ref.data.apiService;

    let payload: apiToBackend.ToBackendGetEnvsListRequestPayload = {
      projectId: member.projectId,
      isFilter: false
    };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload: payload
      })
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetEnvsListResponse) =>
            resp.payload.envsList
        ),
        tap(x => {
          this.envsList = x.filter(z => z.envId !== common.PROJECT_ENV_PROD);
          this.envsListLoading = false;
          this.envsListLength = x.length - 1;
        }),
        take(1)
      )
      .subscribe();
  }

  add() {
    this.addEnvForm.markAllAsTouched();

    if (!this.addEnvForm.valid) {
      return;
    }

    this.ref.close();

    let member: common.Member = this.ref.data.member;

    let payload: apiToBackend.ToBackendEditMemberRequestPayload = {
      projectId: member.projectId,
      memberId: member.memberId,
      isAdmin: member.isAdmin,
      isEditor: member.isEditor,
      isExplorer: member.isExplorer,
      roles: member.roles,
      envs: [...member.envs, this.addEnvForm.value.envId]
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditMember,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditMemberResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.teamStore.update(state => {
              state.members[this.ref.data.i] = resp.payload.member;

              return <TeamState>{
                members: [...state.members],
                total: state.total
              };
            });
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
