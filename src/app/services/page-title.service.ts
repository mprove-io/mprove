import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';

@Injectable()
export class PageTitleService {
  private projectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));
  private dashboardId$ = this.store
    .select(selectors.getSelectedProjectModeRepoDashboardId)
    .pipe(filter(v => !!v));
  private modelId$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelId)
    .pipe(filter(v => !!v));

  constructor(
    private title: Title,
    private store: Store<interfaces.AppState>
  ) {}

  setProjectSubtitle(subtitle: string): Subscription {
    return this.projectId$.subscribe(projectId =>
      this.title.setTitle(`${projectId} | ${subtitle}`)
    );
  }

  setDashboardTitle(): Subscription {
    return this.dashboardId$
      .pipe(
        mergeMap(dashboardId =>
          this.projectId$.pipe(map(projectId => ({ projectId, dashboardId })))
        )
      )
      .subscribe(dashboardTitle =>
        this.title.setTitle(
          `${dashboardTitle.projectId} | Dashboard ${
            dashboardTitle.dashboardId
          }`
        )
      );
  }

  setModelTitle(): Subscription {
    return this.modelId$
      .pipe(
        mergeMap(modelId =>
          this.projectId$.pipe(map(projectId => ({ projectId, modelId })))
        )
      )
      .subscribe(dashboardTitle =>
        this.title.setTitle(
          `${dashboardTitle.projectId} | Model ${dashboardTitle.modelId}`
        )
      );
  }

  setTitle(title: string): void {
    this.title.setTitle(title);
  }
}
