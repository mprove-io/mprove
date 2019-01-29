import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as enums from '@app/enums/_index';

@Injectable()
export class NavigateService {
  projectId: string;
  mode: enums.LayoutModeEnum;
  modelId: string;
  mconfigId: string;
  queryId: string;
  chartId: string;

  constructor(
    private store: Store<interfaces.AppState>,
    private router: Router
  ) {}

  navigateSwitch(newMconfigId: string, newQueryId: string) {
    let pathArray: string[] = this.router.url.split('/');

    switch (pathArray[11]) {
      case 'filters': {
        this.navigateMconfigQueryFilters(newMconfigId, newQueryId);
        break;
      }

      case 'sql': {
        this.navigateMconfigQuerySql(newMconfigId, newQueryId);
        break;
      }

      case 'data': {
        this.navigateMconfigQueryData(newMconfigId, newQueryId);
        break;
      }

      case 'chart': {
        this.navigateMconfigQueryChart(newMconfigId, newQueryId);
        break;
      }

      default: {
        this.navigateMconfigQueryData(newMconfigId, newQueryId);
      }
    }
  }

  navigateMconfigQueryData(mconfigId?: string, queryId?: string) {
    this.getStoreValues();
    this.router.navigate([
      '/project',
      this.projectId,
      'mode',
      this.mode,
      'model',
      this.modelId,
      'mconfig',
      mconfigId ? mconfigId : this.mconfigId,
      'query',
      queryId ? queryId : this.queryId,
      'data'
    ]);
  }

  navigateMconfigQueryFilters(mconfigId?: string, queryId?: string) {
    this.getStoreValues();
    this.router.navigate([
      '/project',
      this.projectId,
      'mode',
      this.mode,
      'model',
      this.modelId,
      'mconfig',
      mconfigId ? mconfigId : this.mconfigId,
      'query',
      queryId ? queryId : this.queryId,
      'filters'
    ]);
  }

  navigateMconfigQuerySql(mconfigId?: string, queryId?: string) {
    this.getStoreValues();
    this.router.navigate([
      '/project',
      this.projectId,
      'mode',
      this.mode,
      'model',
      this.modelId,
      'mconfig',
      mconfigId ? mconfigId : this.mconfigId,
      'query',
      queryId ? queryId : this.queryId,
      'sql'
    ]);
  }

  navigateMconfigQueryChart(
    mconfigId?: string,
    queryId?: string,
    chartId?: string
  ) {
    this.getStoreValues();
    this.router.navigate([
      '/project',
      this.projectId,
      'mode',
      this.mode,
      'model',
      this.modelId,
      'mconfig',
      mconfigId ? mconfigId : this.mconfigId,
      'query',
      queryId ? queryId : this.queryId,
      'chart',
      chartId ? chartId : this.chartId
    ]);
  }

  navigateModelMconfigQueryChart(
    modelId?: string,
    mconfigId?: string,
    queryId?: string,
    chartId?: string
  ) {
    this.getStoreValues();
    this.router.navigate([
      '/project',
      this.projectId,
      'mode',
      this.mode,
      'model',
      modelId ? modelId : this.modelId,
      'mconfig',
      mconfigId ? mconfigId : this.mconfigId,
      'query',
      queryId ? queryId : this.queryId,
      'chart',
      chartId ? chartId : this.chartId
    ]);
  }

  navigateDashboard(dashboardId: string) {
    this.getStoreValues();
    this.router.navigate([
      '/project',
      this.projectId,
      'mode',
      this.mode,
      'dashboard',
      dashboardId
    ]);
  }

  navigateModel(modelId?: string, joinAs?: string) {
    this.getStoreValues();
    this.router.navigate(
      [
        '/project',
        this.projectId,
        'mode',
        this.mode,
        'model',
        modelId ? modelId : this.modelId
      ],
      {
        queryParams: { joinAs: joinAs }
      }
    );
  }

  navigateToFileLine(fileId: string, line?: number) {
    this.getStoreValues();

    if (line) {
      this.router.navigate(
        [
          '/project',
          this.projectId,
          'mode',
          this.mode,
          'blockml',
          'file',
          fileId
        ],
        {
          queryParams: { line: line }
        }
      );
    } else {
      this.router.navigate([
        '/project',
        this.projectId,
        'mode',
        this.mode,
        'blockml',
        'file',
        fileId
      ]);
    }
  }

  private getStoreValues() {
    this.store
      .select(selectors.getLayoutProjectId)
      .pipe(take(1))
      .subscribe(x => (this.projectId = x));

    this.store
      .select(selectors.getLayoutMode)
      .pipe(take(1))
      .subscribe(x => (this.mode = x));

    this.store
      .select(selectors.getSelectedProjectModeRepoModelId)
      .pipe(take(1))
      .subscribe(x => (this.modelId = x));

    this.store
      .select(selectors.getSelectedMconfigId)
      .pipe(take(1))
      .subscribe(x => (this.mconfigId = x));

    this.store
      .select(selectors.getSelectedQueryId)
      .pipe(take(1))
      .subscribe(x => (this.queryId = x));

    this.store
      .select(selectors.getLayoutChartId)
      .pipe(take(1))
      .subscribe(x => (this.chartId = x));
  }
}
