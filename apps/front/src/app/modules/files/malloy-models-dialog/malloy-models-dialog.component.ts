import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs';
import { EMPTY_CHART_ID } from '#common/constants/top';
import { ModelX } from '#common/interfaces/backend/model-x';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { SharedModule } from '../../shared/shared.module';

export interface MalloyModelsDialogData {
  apiService: ApiService;
  models: ModelX[];
}

@Component({
  selector: 'm-malloy-models-dialog',
  templateUrl: './malloy-models-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, NgxSpinnerModule, SharedModule, TippyDirective]
})
export class MalloyModelsDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  spinnerName = 'dashboardAddTile';

  models: ModelX[];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<MalloyModelsDialogData>,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
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
    let model = this.models.find(x => x.modelId === modelId);

    if (model.hasAccess === false) {
      return;
    }

    this.ref.close();

    this.navigateService.navigateToChart({
      modelId: modelId,
      chartId: EMPTY_CHART_ID
    });
  }
}
