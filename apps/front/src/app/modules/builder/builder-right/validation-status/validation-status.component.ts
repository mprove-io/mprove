import { ChangeDetectorRef, Component } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import type { ToBackendValidateFilesInput } from '#common/zod/backend/routes/files/validate-files/validate-files-request';
import type { ToBackendValidateFilesResponse } from '#common/zod/backend/routes/files/validate-files/validate-files-response';
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
  repoTypeEnum = RepoTypeEnum;

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
    let payload: ToBackendValidateFilesInput = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        route: 'api/ToBackendValidateFiles',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendValidateFilesResponse) => {
          if (resp.result?.type === 'Success') {
            this.repoQuery.update(resp.result.value.repo);
            this.structQuery.update(resp.result.value.struct);
            this.navQuery.updatePart({
              needValidate: resp.result.value.needValidate
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
