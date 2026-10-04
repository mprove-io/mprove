import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_SANDBOX_PROVIDER_PAGE_TITLE } from '#common/constants/page-titles';
import type { Project } from '#common/types/backend/parts/project/project';
import type { ToBackendSetProjectSandboxProviderRequest } from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-request';
import type { ToBackendSetProjectSandboxProviderResponse } from '#common/types/backend/routes/projects/set-project-sandbox-provider/set-project-sandbox-provider-response';
import { MemberQuery } from '#front/app/queries/member.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-sandbox-provider',
  templateUrl: './project-sandbox-provider.component.html'
})
export class ProjectSandboxProviderComponent implements OnInit {
  pageTitle = PROJECT_SANDBOX_PROVIDER_PAGE_TITLE;

  project: Project;
  project$ = this.projectQuery.select().pipe(
    tap(x => {
      this.project = x;
      this.cd.detectChanges();
    })
  );

  isAdmin: boolean;
  isAdmin$ = this.memberQuery.isAdmin$.pipe(
    tap(x => {
      this.isAdmin = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private projectQuery: ProjectQuery,
    private memberQuery: MemberQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  editE2bApiKey() {
    this.myDialogService.showEditSandboxProvider({
      apiService: this.apiService,
      projectId: this.project.projectId
    });
  }

  deleteE2bApiKey() {
    let payload: ToBackendSetProjectSandboxProviderRequest['input'] = {
      projectId: this.project.projectId,
      e2bApiKey: ''
    };

    this.apiService
      .req({
        route: 'api/ToBackendSetProjectSandboxProvider',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetProjectSandboxProviderResponse) => {
          if (resp?.type === 'Success') {
            this.projectQuery.update(resp.output.project);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
