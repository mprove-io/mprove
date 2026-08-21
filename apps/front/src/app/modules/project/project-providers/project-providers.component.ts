import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_PROVIDERS_PAGE_TITLE } from '#common/constants/page-titles';
import { LlmModelInactiveReasonEnum } from '#common/enums/llm-model-inactive-reason.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendToggleProviderRequestPayload } from '#common/zod/to-backend/providers/toggle-provider/toggle-provider-request-payload';
import type { ToBackendToggleProviderResponse } from '#common/zod/to-backend/providers/toggle-provider/toggle-provider-response';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { LLM_MODEL_INACTIVE_REASON_LABELS } from './llm-model-inactive-reason-labels';

@Component({
  standalone: false,
  selector: 'm-project-providers',
  templateUrl: './project-providers.component.html'
})
export class ProjectProvidersComponent implements OnInit {
  pageTitle = PROJECT_PROVIDERS_PAGE_TITLE;

  projectId: string;
  projectId$ = this.navQuery.projectId$.pipe(
    tap(x => {
      this.projectId = x;
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

  providers: Provider[] = [];

  providerTypeEnum = ProviderTypeEnum;
  inactiveReasonLabels = LLM_MODEL_INACTIVE_REASON_LABELS;

  providers$ = this.providersQuery.providers$.pipe(
    tap(x => {
      this.providers = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private providersQuery: ProvidersQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);
  }

  inactiveReasonsText(item: { reasons: LlmModelInactiveReasonEnum[] }): string {
    let { reasons } = item;
    return reasons.map(reason => this.inactiveReasonLabels[reason]).join('\n');
  }

  formatContextLimit(item: { contextLimit?: number }): string {
    let { contextLimit } = item;

    if (contextLimit === undefined) {
      return '';
    }

    if (contextLimit >= 1000000) {
      return `${Math.round(contextLimit / 1000000)}M`;
    }

    if (contextLimit >= 1000) {
      return `${Math.round(contextLimit / 1000)}K`;
    }

    return contextLimit.toString();
  }

  addProvider() {
    this.myDialogService.showAddProvider({
      apiService: this.apiService,
      projectId: this.projectId
    });
  }

  editProvider(item: { provider: Provider }) {
    let { provider } = item;
    this.myDialogService.showEditProvider({
      apiService: this.apiService,
      projectId: provider.projectId,
      provider: provider
    });
  }

  deleteProvider(item: { provider: Provider }) {
    let { provider } = item;
    this.myDialogService.showDeleteProvider({
      apiService: this.apiService,
      projectId: provider.projectId,
      providerId: provider.providerId
    });
  }

  addLlmModel(item: { provider: Provider }) {
    let { provider } = item;
    this.myDialogService.showAddLlmModel({
      apiService: this.apiService,
      provider: provider
    });
  }

  editLlmModel(item: { provider: Provider; model: LlmModel }) {
    let { provider, model } = item;
    this.myDialogService.showEditLlmModel({
      apiService: this.apiService,
      provider: provider,
      model: model
    });
  }

  deleteLlmModel(item: { provider: Provider; model: LlmModel }) {
    let { provider, model } = item;
    this.myDialogService.showDeleteLlmModel({
      apiService: this.apiService,
      provider: provider,
      model: model
    });
  }

  toggleProvider(item: { provider: Provider }) {
    let { provider } = item;
    if (this.isAdmin !== true) {
      return;
    }

    let payload: ToBackendToggleProviderRequestPayload = {
      projectId: provider.projectId,
      providerId: provider.providerId,
      isEnabled: !provider.isEnabled
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendToggleProvider,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendToggleProviderResponse) => {
          if (resp.info?.status !== ResponseInfoStatusEnum.Ok) {
            return;
          }

          let providers = this.providersQuery
            .getValue()
            .providers.map(x =>
              x.providerId === resp.payload.provider.providerId
                ? resp.payload.provider
                : x
            );

          this.providersQuery.updatePart({
            providers: providers
          });
        }),
        take(1)
      )
      .subscribe();
  }
}
