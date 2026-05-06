import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { map, take } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ToBackendViewCachedColumnResponse } from '#common/zod/to-backend/connections/to-backend-view-cached-column';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../../../../shared/shared.module';

export interface ViewCachedUniqueValuesDialogData {
  title: string;
  subtitle: string;
  columnName: string;
  columnNames: string[];
  rows: string[][];
  errorMessage: string;
  projectId: string;
  envId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
}

@Component({
  selector: 'm-view-cached-unique-values-dialog',
  templateUrl: './view-cached-unique-values-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, NgScrollbarModule, NgxSpinnerModule]
})
export class ViewCachedUniqueValuesDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem = this.ref.data;
  isLoading = false;
  hasMore = true;
  offset = 100;

  cachedUniqueValuesNextSpinnerName = 'cachedUniqueValuesNext';

  constructor(
    public ref: DialogRef<ViewCachedUniqueValuesDialogData>,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    if (this.dataItem.rows.length < 100) {
      this.hasMore = false;
    }

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  loadNext() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.spinner.show(this.cachedUniqueValuesNextSpinnerName);
    this.cd.detectChanges();

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendViewCachedColumn,
        payload: {
          projectId: this.dataItem.projectId,
          envId: this.dataItem.envId,
          connectionId: this.dataItem.connectionId,
          schemaName: this.dataItem.schemaName,
          tableName: this.dataItem.tableName,
          columnName: this.dataItem.columnName,
          offset: this.offset
        }
      })
      .pipe(
        map((resp: ToBackendViewCachedColumnResponse) => {
          setTimeout(() => {
            let isRespPayloadErrorMessageDefined = isDefined(
              resp.payload.errorMessage
            );

            if (
              resp.info?.status === ResponseInfoStatusEnum.Ok &&
              isRespPayloadErrorMessageDefined
            ) {
              this.dataItem.errorMessage = resp.payload.errorMessage;
            } else if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              this.dataItem.columnNames = resp.payload.columnNames;
              this.dataItem.rows = resp.payload.rows;
              this.dataItem.errorMessage = undefined;
              this.offset += 100;

              if (resp.payload.rows.length < 100) {
                this.hasMore = false;
              }
            } else {
              this.dataItem.errorMessage = 'Failed to fetch cached column';
            }

            this.isLoading = false;
            this.spinner.hide(this.cachedUniqueValuesNextSpinnerName);
            this.cd.detectChanges();
          }, 0);
        }),
        take(1)
      )
      .subscribe();
  }
}
