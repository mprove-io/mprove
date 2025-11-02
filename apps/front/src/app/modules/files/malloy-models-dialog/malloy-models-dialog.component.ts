import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { EMPTY_CHART_ID } from '~common/constants/top';
import { Model } from '~common/interfaces/blockml/model';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

export interface MalloyModelsDialogData {
  apiService: ApiService;
  models: Model[];
}

@Component({
  selector: 'm-malloy-models-dialog',
  templateUrl: './malloy-models-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, NgxSpinnerModule]
})
export class MalloyModelsDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  spinnerName = 'dashboardAddTile';

  models: Model[];

  constructor(
    public ref: DialogRef<MalloyModelsDialogData>,
    private navQuery: NavQuery,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  async ngOnInit() {
    this.models = this.ref.data.models;

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  navToModel(modelId: string) {
    this.ref.close();

    this.navigateService.navigateToChart({
      modelId: modelId,
      chartId: EMPTY_CHART_ID
    });
  }
}
