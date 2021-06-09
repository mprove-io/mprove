import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { MconfigQuery } from '~front/app/queries/mconfig.query';
import { ModelQuery } from '~front/app/queries/model.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { ValidationService } from '~front/app/services/validation.service';
import { MconfigState } from '~front/app/stores/mconfig.store';
import { ModelState } from '~front/app/stores/model.store';
import { NavState } from '~front/app/stores/nav.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-model',
  templateUrl: './model.component.html'
})
export class ModelComponent {
  lastUrl: string;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('/');
      this.lastUrl = ar[ar.length - 1];
      this.cd.detectChanges();
    })
  );

  mconfig: MconfigState;
  mconfig$ = this.mconfigQuery.select().pipe(
    tap(x => {
      this.mconfig = x;
      if (x.limit) {
        this.limitForm.controls['limit'].setValue(x.limit);
      }

      // console.log(this.mconfig.select);
      this.cd.detectChanges();
    })
  );

  limitForm: FormGroup = this.fb.group({
    limit: [
      undefined,
      [
        Validators.required,
        ValidationService.integerValidator,
        Validators.min(1),
        Validators.max(500)
      ]
    ]
  });

  filtersIsExpanded = false;
  chartIsExpanded = false;
  dataIsExpanded = true;

  sqlIsShow = true;
  resultsIsShow = true;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private uiQuery: UiQuery,
    private modelQuery: ModelQuery,
    public repoQuery: RepoQuery,
    public mconfigQuery: MconfigQuery,
    public repoStore: RepoStore,
    private apiService: ApiService,
    public structStore: StructStore,
    public fileService: FileService,
    public navigateService: NavigateService
  ) {}

  toggleSql() {
    this.sqlIsShow = !this.sqlIsShow;
    if (this.resultsIsShow === false && this.sqlIsShow === false) {
      this.resultsIsShow = true;
    }
  }

  toggleResults() {
    this.resultsIsShow = !this.resultsIsShow;

    if (this.sqlIsShow === false && this.resultsIsShow === false) {
      setTimeout(() => (this.sqlIsShow = true));
    }

    if (this.sqlIsShow === true) {
      this.sqlIsShow = false;
      setTimeout(() => (this.sqlIsShow = true));
    }
  }

  toggleFiltersPanel() {
    this.filtersIsExpanded = !this.filtersIsExpanded;
    if (this.dataIsExpanded) {
      this.dataIsExpanded = false;
      setTimeout(() => (this.dataIsExpanded = true));
    }
  }

  toggleChartPanel() {
    this.chartIsExpanded = !this.chartIsExpanded;
    if (this.dataIsExpanded) {
      this.dataIsExpanded = false;
      setTimeout(() => (this.dataIsExpanded = true));
    }
  }

  toggleDataPanel() {
    this.dataIsExpanded = !this.dataIsExpanded;
  }

  goToFile() {
    let fileIdAr = this.model.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }
}
