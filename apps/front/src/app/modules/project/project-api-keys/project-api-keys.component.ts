import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_API_KEYS_PAGE_TITLE } from '#common/constants/page-titles';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { Project } from '#common/interfaces/backend/project';
import {
  ToBackendSetProjectApiKeyRequestPayload,
  ToBackendSetProjectApiKeyResponse
} from '#common/interfaces/to-backend/projects/to-backend-set-project-api-key';
import { MemberQuery } from '#front/app/queries/member.query';
import { ProjectQuery } from '#front/app/queries/project.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-project-api-keys',
  templateUrl: './project-api-keys.component.html'
})
export class ProjectApiKeysComponent implements OnInit {
  pageTitle = PROJECT_API_KEYS_PAGE_TITLE;

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

  editZenApiKey() {
    this.myDialogService.showEditApiKey({
      apiService: this.apiService,
      projectId: this.project.projectId,
      keyLabel: 'Opencode Zen API Key',
      fieldName: 'zenApiKey'
    });
  }

  editAnthropicApiKey() {
    this.myDialogService.showEditApiKey({
      apiService: this.apiService,
      projectId: this.project.projectId,
      keyLabel: 'Anthropic API Key',
      fieldName: 'anthropicApiKey'
    });
  }

  editOpenaiApiKey() {
    this.myDialogService.showEditApiKey({
      apiService: this.apiService,
      projectId: this.project.projectId,
      keyLabel: 'OpenAI API Key',
      fieldName: 'openaiApiKey'
    });
  }

  editE2bApiKey() {
    this.myDialogService.showEditApiKey({
      apiService: this.apiService,
      projectId: this.project.projectId,
      keyLabel: 'E2B API Key',
      fieldName: 'e2bApiKey'
    });
  }

  deleteZenApiKey() {
    this.deleteApiKey('zenApiKey');
  }

  deleteAnthropicApiKey() {
    this.deleteApiKey('anthropicApiKey');
  }

  deleteOpenaiApiKey() {
    this.deleteApiKey('openaiApiKey');
  }

  deleteE2bApiKey() {
    this.deleteApiKey('e2bApiKey');
  }

  private deleteApiKey(
    fieldName: 'zenApiKey' | 'anthropicApiKey' | 'openaiApiKey' | 'e2bApiKey'
  ) {
    let payload: ToBackendSetProjectApiKeyRequestPayload = {
      projectId: this.project.projectId,
      [fieldName]: ''
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSetProjectApiKey,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendSetProjectApiKeyResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.projectQuery.update(resp.payload.project);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
