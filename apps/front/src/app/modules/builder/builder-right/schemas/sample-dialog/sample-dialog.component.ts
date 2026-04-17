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
import type { ToBackendGetConnectionSampleResponse } from '#common/zod/to-backend/connections/to-backend-get-connection-sample';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../../../../shared/shared.module';

export interface SampleDialogData {
  title: string;
  subtitle: string;
  columnNames: string[];
  rows: string[][];
  errorMessage: string;
  projectId: string;
  envId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName: string;
}

@Component({
  selector: 'm-sample-dialog',
  templateUrl: './sample-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, SharedModule, NgScrollbarModule, NgxSpinnerModule]
})
export class SampleDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem = this.ref.data;
  isLoading = false;
  hasMore = true;
  offset = 100;

  sampleNextSpinnerName = 'sampleNext';

  constructor(
    public ref: DialogRef<SampleDialogData>,
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
    this.spinner.show(this.sampleNextSpinnerName);
    this.cd.detectChanges();

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample,
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
        map((resp: ToBackendGetConnectionSampleResponse) => {
          setTimeout(() => {
            if (
              resp.info?.status === ResponseInfoStatusEnum.Ok &&
              isDefined(resp.payload.errorMessage)
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
              this.dataItem.errorMessage = 'Failed to fetch sample data';
            }

            this.isLoading = false;
            this.spinner.hide(this.sampleNextSpinnerName);
            this.cd.detectChanges();
          }, 0);
        }),
        take(1)
      )
      .subscribe();
  }
}
