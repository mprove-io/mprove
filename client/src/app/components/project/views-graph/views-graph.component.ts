import { Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap, take } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-views-graph',
  templateUrl: 'views-graph.component.html',
  styleUrls: ['views-graph.component.scss']
})
export class ViewsGraphComponent {
  nodes = [];
  nodesOriginalStr = JSON.stringify([]);
  links = [];
  linksOriginalStr = JSON.stringify([]);

  views: api.View[];
  views$ = this.store
    .select(selectors.getSelectedProjectModeRepoStructViewsSorted)
    .pipe(
      filter(v => !!v),
      tap(views => {
        let nodes = [];
        let links = [];

        views.forEach(view => {
          nodes.push({
            id: view.view_id,
            label: view.view_id,
            color: view.is_pdt ? 'rgb(122, 163, 229)' : 'rgb(165, 215, 198)'
          });

          view.view_deps.forEach(x => {
            links.push({
              source: x,
              target: view.view_id
            });
          });
        });

        if (
          this.nodesOriginalStr !== JSON.stringify(nodes) ||
          this.linksOriginalStr !== JSON.stringify(links)
        ) {
          this.nodes = nodes;
          this.links = links;

          this.nodesOriginalStr = JSON.stringify(nodes);
          this.linksOriginalStr = JSON.stringify(links);

          // if (this.nodesOriginalStr !== JSON.stringify(nodes)) {
          //   console.log('this.nodesOriginalStr:', this.nodesOriginalStr);
          //   console.log('JSON.stringify(nodes):', JSON.stringify(nodes));
          // }
          // if (this.linksOriginalStr !== JSON.stringify(links)) {
          //   console.log('this.linksOriginalStr:', this.linksOriginalStr);
          //   console.log('JSON.stringify(links):', JSON.stringify(links));
          // }
        }
      })
    );

  selectedProjectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  isDev$ = this.store.select(selectors.getLayoutModeIsDev); // no filter here

  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private myDialogService: services.MyDialogService,
    public pageTitle: services.PageTitleService,
    private navigateService: services.NavigateService
  ) {
    this.pageTitle.setProjectSubtitle('Views Graph');
  }

  canDeactivate(): boolean {
    // used in component-deactivate-guard
    this.printer.log(
      enums.busEnum.CAN_DEACTIVATE_CHECK,
      'from ViewsGraphComponent:',
      event
    );
    return true;
  }

  // removePrefix(text) {
  //   return text.substring(text.indexOf('_') + 1);
  // }

  navigateFile(node: any): void {
    let files: api.CatalogFile[] = [];
    this.store
      .select(selectors.getSelectedProjectModeRepoFiles)
      .pipe(take(1))
      .subscribe(x => (files = x));

    let viewFileName = node.id + '.view';

    let file = files.find(f => f.name === viewFileName);

    this.navigateService.navigateToFileLine(file.file_id, 1);
  }
}
