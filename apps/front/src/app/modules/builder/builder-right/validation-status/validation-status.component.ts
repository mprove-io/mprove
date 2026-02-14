import { ChangeDetectorRef, Component } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendValidateFilesRequestPayload,
  ToBackendValidateFilesResponse
} from '#common/interfaces/to-backend/files/to-backend-validate-files';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';

@Component({
  standalone: false,
  selector: 'm-validation-status',
  templateUrl: './validation-status.component.html'
})
export class ValidationStatusComponent {
  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  secondFileNodeId: string;
  secondFileNodeId$ = this.uiQuery.secondFileNodeId$.pipe(
    tap(x => {
      this.secondFileNodeId = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  validate() {
    let payload: ToBackendValidateFilesRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendValidateFiles,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendValidateFilesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
