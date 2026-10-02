import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { ToBackendDeleteProviderRequest } from '#common/types/backend/routes/providers/delete-provider/delete-provider-request';
import type { ToBackendDeleteProviderResponse } from '#common/types/backend/routes/providers/delete-provider/delete-provider-response';
import { ProvidersQuery } from '#front/app/queries/providers.query';
import { ApiService } from '#front/app/services/api.service';

export interface DeleteProviderDialogData {
  apiService: ApiService;
  projectId: string;
  providerId: string;
}

@Component({
  selector: 'm-delete-provider-dialog',
  templateUrl: './delete-provider-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteProviderDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteProviderDialogData>,
    private providersQuery: ProvidersQuery
  ) {}

  ngOnInit() {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteProviderRequest['input'] = {
      projectId: this.ref.data.projectId,
      providerId: this.ref.data.providerId
    };

    this.ref.data.apiService
      .req({
        route: 'api/ToBackendDeleteProvider',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteProviderResponse) => {
          if (resp?.type !== 'Success') {
            return;
          }

          let providers = this.providersQuery
            .getValue()
            .providers.filter(
              x =>
                x.projectId !== this.ref.data.projectId ||
                x.providerId !== this.ref.data.providerId
            );
          this.providersQuery.updatePart({
            providers: providers
          });
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
