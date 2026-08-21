import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_SANDBOX_PROVIDER_PAGE_TITLE } from '#common/constants/page-titles';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Project } from '#common/zod/backend/project';
import type {
  ToBackendSetProjectSandboxProviderRequestPayload,
  ToBackendSetProjectSandboxProviderResponse
} from '#common/zod/to-backend/projects/to-backend-set-project-sandbox-provider';
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
    let payload: ToBackendSetProjectSandboxProviderRequestPayload = {
      projectId: this.project.projectId,
      e2bApiKey: ''
    };

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendSetProjectSandboxProvider,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetProjectSandboxProviderResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.projectQuery.update(resp.payload.project);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
