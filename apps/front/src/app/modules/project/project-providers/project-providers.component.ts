import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, tap } from 'rxjs/operators';
import { PROJECT_PROVIDERS_PAGE_TITLE } from '#common/constants/page-titles';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type { LlmModel } from '#common/zod/backend/provider-parts/llm-model';
import type {
  ToBackendToggleProviderRequestPayload,
  ToBackendToggleProviderResponse
} from '#common/zod/to-backend/providers/to-backend-toggle-provider';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

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

  addProviderModel(item: { provider: Provider }) {
    let { provider } = item;
    this.myDialogService.showAddProviderModel({
      apiService: this.apiService,
      provider: provider
    });
  }

  editProviderModel(item: { provider: Provider; model: LlmModel }) {
    let { provider, model } = item;
    this.myDialogService.showEditProviderModel({
      apiService: this.apiService,
      provider: provider,
      model: model
    });
  }

  deleteProviderModel(item: { provider: Provider; model: LlmModel }) {
    let { provider, model } = item;
    this.myDialogService.showDeleteProviderModel({
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

          this.providersQuery.update({
            providers: providers
          });
        }),
        take(1)
      )
      .subscribe();
  }
}
