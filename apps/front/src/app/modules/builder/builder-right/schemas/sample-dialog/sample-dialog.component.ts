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
import { NgxSpinnerModule } from 'ngx-spinner';
import { delay, finalize, take, tap } from 'rxjs/operators';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ToBackendGetConnectionSampleOutput } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-output';
import { ApiService } from '#front/app/services/api.service';
import { LocalSpinnerService } from '#front/app/services/local-spinner.service';
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
    private localSpinnerService: LocalSpinnerService
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
    this.cd.detectChanges();

    this.apiService
      .req({
        route: 'api/ToBackendGetConnectionSample',
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
        delay(0),
        tap(resp => {
          if (resp.type === 'Success') {
            let output: ToBackendGetConnectionSampleOutput = resp.output;

            if (isDefined(output.errorMessage)) {
              this.dataItem.errorMessage = output.errorMessage;
            } else {
              this.dataItem.columnNames = output.columnNames;
              this.dataItem.rows = output.rows;
              this.dataItem.errorMessage = undefined;
              this.offset += 100;

              if (output.rows.length < 100) {
                this.hasMore = false;
              }
            }
          } else {
            this.dataItem.errorMessage = 'Failed to fetch sample data';
          }
        }),
        take(1),
        finalize(() => {
          this.isLoading = false;

          this.cd.detectChanges();
        }),
        this.localSpinnerService.track({ name: this.sampleNextSpinnerName })
      )
      .subscribe();
  }
}
