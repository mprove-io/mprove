import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  IActionMapping,
  KEYS,
  TreeComponent,
  TreeNode
} from 'angular-tree-component';
import { debounceTime, filter, map, take, tap } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-model-tree',
  templateUrl: 'model-tree.component.html',
  styleUrls: ['model-tree.component.scss']
})
export class ModelTreeComponent implements AfterViewInit {
  countSelectedItemsKey = Symbol('count selected items in parent');

  fieldClassEnum = api.ModelFieldFieldClassEnum;

  actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node, $event) => {}
    },
    keys: {
      [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.label}`)
    }
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'label'
  };

  nodes: interfaces.ModelNodeField[];
  nodes$ = this.store.select(selectors.getSelectedMconfigModelNodes).pipe(
    filter(v => !!v),
    map(x => JSON.parse(JSON.stringify(x))),
    map(nodes => {
      return nodes.map((item: interfaces.ModelNodeField) => {
        return Object.assign(item, { [this.countSelectedItemsKey]: 0 });
      });
    }),
    tap(x => {
      x.forEach((item: interfaces.ModelNodeField) =>
        this.parentNodeInfo(item, item.children)
      );
      this.nodes = x;
    })
  );

  modelFields: api.ModelField[];
  modelFields$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelFields)
    .pipe(
      filter(v => !!v),
      tap(x => (this.modelFields = x))
    );

  fields: interfaces.ModelFieldExtra[];
  fields$ = this.store
    .select(selectors.getSelectedMconfigModelFieldsExtra)
    .pipe(
      filter(v => !!v),
      tap(x => (this.fields = x))
    );

  joinAs: string;
  joinAs$ = this.route.queryParams.pipe(
    tap(
      params => (this.joinAs = params['joinAs'] ? params['joinAs'] : undefined)
    )
  );

  modelId: string;
  modelId$ = this.store
    .select(selectors.getSelectedProjectModeRepoModelId)
    .pipe(
      filter(v => !!v),
      debounceTime(1), // wait until nodes updated
      tap(x => {
        if (this.modelId && this.modelId !== x) {
          this.itemsTree.treeModel.collapseAll();
          this.expandFirstNode();
        }

        this.modelId = x;
      })
    );

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
    private route: ActivatedRoute,
    private structService: services.StructService,
    private navigateService: services.NavigateService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.filterHidden();

      let nodeJoin;

      if (this.joinAs) {
        nodeJoin = this.itemsTree.treeModel.getNodeById(this.joinAs);
      }

      if (nodeJoin) {
        nodeJoin.expand();
      } else {
        this.expandFirstNode();
      }
    }, 1);
  }

  expandFirstNode() {
    let modelFirstNode = this.nodes[0];

    if (modelFirstNode) {
      let nodeStart = this.itemsTree.treeModel.getNodeById(modelFirstNode.id);

      if (nodeStart) {
        nodeStart.expand();
      }
    }
  }

  parentNodeInfo(
    rootNode: any,
    nodeFieldArray: interfaces.ModelNodeField[]
  ): void {
    for (let item of nodeFieldArray) {
      if (item.is_field) {
        if (item.field.is_selected || item.field.is_filtered) {
          rootNode[this.countSelectedItemsKey]++;
        }
      }
      if (item.children.length > 0) {
        this.parentNodeInfo(rootNode, item.children);
      }
    }
  }

  filterHidden() {
    this.itemsTree.treeModel.doForAll((node: TreeNode) => {
      let hidden =
        node.parent && node.parent.parent
          ? node.parent.parent.data.hidden ||
            node.parent.data.hidden ||
            node.data.hidden
          : node.parent
          ? node.parent.data.hidden || node.data.hidden
          : node.data.hidden;

      node.setIsHidden(hidden);

      return;
    });
  }

  nodeOnClick(node: TreeNode) {
    if (
      node.data.is_field &&
      node.data.field.field_class !== api.ModelFieldFieldClassEnum.Filter
    ) {
      let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

      if (node.data.field.is_selected) {
        // field is active, should be removed
        newMconfig = this.removeField(newMconfig, node.data.id);
      } else {
        // field is not active, should be added to select (with force_dims)
        newMconfig.select = [...newMconfig.select, node.data.id];

        node.data.field.force_dims.forEach((id: string) => {
          let index = newMconfig.select.findIndex(x => x === id);

          if (index < 0) {
            newMconfig.select = [...newMconfig.select, id];

            let label = this.modelFields.find(f => f.id === id).label;
            this.myDialogService.showReqDimAddedDialog(label);
          }
        });
      }

      this.dispatchData(newMconfig, newQuery);
      setTimeout(
        () =>
          this.navigateService.navigateMconfigQueryData(
            newMconfig.mconfig_id,
            newQuery.query_id
          ),
        1
      );
    } else if (node.hasChildren) {
      // not field and has children
      node.toggleExpanded();
    }
  }

  removeField(newMconfig: api.Mconfig, fieldId: string) {
    newMconfig = this.removeFieldFromSelect(newMconfig, fieldId);
    newMconfig = this.removeFieldFromSortings(newMconfig, fieldId);

    newMconfig.charts = newMconfig.charts.map(chart =>
      this.removeFieldFromChart(chart, fieldId)
    );

    newMconfig.filters.forEach(x => {
      let field = this.fields.find(f => f.id === x.field_id);

      let index = field.force_dims.findIndex(id => id === fieldId);

      if (index > -1) {
        newMconfig = this.removeFieldFromFilters(newMconfig, x.field_id);

        let label = this.modelFields.find(f => f.id === x.field_id).label;
        this.myDialogService.showDepCalcRemovedDialog(label, 'filters');
      }
    });

    newMconfig.select.forEach(x => {
      let field = this.fields.find(f => f.id === x);

      let index = field.force_dims.findIndex(id => id === fieldId);

      if (index > -1) {
        newMconfig = this.removeField(newMconfig, x);

        let label = this.modelFields.find(f => f.id === x).label;
        this.myDialogService.showDepCalcRemovedDialog(label, 'select');
      }
    });

    return newMconfig;
  }

  removeFieldFromSelect(newMconfig: api.Mconfig, fieldId: string) {
    let fieldIndex = newMconfig.select.findIndex(
      selectId => selectId === fieldId
    );

    newMconfig.select = [
      ...newMconfig.select.slice(0, fieldIndex),
      ...newMconfig.select.slice(fieldIndex + 1)
    ];

    return newMconfig;
  }

  removeFieldFromFilters(newMconfig: api.Mconfig, fieldId: string) {
    let fieldIndex = newMconfig.filters.findIndex(f => f.field_id === fieldId);

    newMconfig.filters = [
      ...newMconfig.filters.slice(0, fieldIndex),
      ...newMconfig.filters.slice(fieldIndex + 1)
    ];

    return newMconfig;
  }

  removeFieldFromSortings(newMconfig: api.Mconfig, fieldId: string) {
    let fIndex = newMconfig.sortings.findIndex(
      sorting => sorting.field_id === fieldId
    );

    if (fIndex >= 0) {
      // field should be removed from sortings and sorts
      newMconfig.sortings = [
        ...newMconfig.sortings.slice(0, fIndex),
        ...newMconfig.sortings.slice(fIndex + 1)
      ];

      let newSorts: string[] = [];

      newMconfig.sortings.forEach(sorting =>
        sorting.desc
          ? newSorts.push(`${sorting.field_id} desc`)
          : newSorts.push(sorting.field_id)
      );

      newMconfig.sorts =
        newMconfig.sortings.length > 0 ? newSorts.join(', ') : null;
    }

    return newMconfig;
  }

  removeFieldFromChart(chart: api.Chart, fieldId: string) {
    let newChart: api.Chart = Object.assign({}, chart);

    if (chart.x_field === fieldId) {
      newChart = Object.assign({}, newChart, { x_field: undefined });
    }

    if (chart.y_field === fieldId) {
      newChart = Object.assign({}, newChart, { y_field: undefined });
    }

    if (chart.y_fields && chart.y_fields.length > 0) {
      let index = chart.y_fields.findIndex(yId => yId === fieldId);

      if (index > -1) {
        newChart = Object.assign({}, newChart, {
          y_fields: [
            ...chart.y_fields.slice(0, index),
            ...chart.y_fields.slice(index + 1)
          ]
        });
      }
    }

    if (chart.hide_columns && chart.hide_columns.length > 0) {
      let index = chart.hide_columns.findIndex(hId => hId === fieldId);

      if (index > -1) {
        newChart = Object.assign({}, newChart, {
          hide_columns: [
            ...chart.hide_columns.slice(0, index),
            ...chart.hide_columns.slice(index + 1)
          ]
        });
      }
    }

    if (chart.multi_field === fieldId) {
      newChart = Object.assign({}, newChart, { multi_field: undefined });
    }

    if (chart.value_field === fieldId) {
      newChart = Object.assign({}, newChart, { value_field: undefined });
    }

    if (chart.previous_value_field === fieldId) {
      newChart = Object.assign({}, newChart, {
        previous_value_field: undefined
      });
    }

    if (chart.is_valid) {
      newChart = Object.assign({}, newChart, {
        is_valid: this.isChartPartValid(newChart)
      });
    }

    return newChart;
  }

  toggleFilter(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    let [newMconfig, newQuery] = this.structService.generateMconfigAndQuery();

    if (node.data.field.is_filtered) {
      //  should be removed from filters
      let filterIndex = newMconfig.filters.findIndex(
        filt => filt.field_id === node.data.id
      );

      newMconfig.filters = [
        ...newMconfig.filters.slice(0, filterIndex),
        ...newMconfig.filters.slice(filterIndex + 1)
      ];
    } else {
      //  should be added to filters
      let newFraction: api.Fraction;

      newFraction = {
        brick: 'any',
        operator: api.FractionOperatorEnum.Or,
        type: api.FractionTypeEnum.StringIsAnyValue // 'any'
      };

      let newFilter: api.Filter = {
        field_id: node.data.field.id,
        fractions: [newFraction]
      };

      newMconfig.filters = [...newMconfig.filters, newFilter];

      // force_dims should be added to select
      node.data.field.force_dims.forEach((id: string) => {
        let index = newMconfig.select.findIndex(x => x === id);

        if (index < 0) {
          newMconfig.select = [...newMconfig.select, id];

          let label = this.modelFields.find(f => f.id === id).label;
          this.myDialogService.showReqDimAddedDialog(label);
        }
      });
    }

    this.dispatchData(newMconfig, newQuery);
    setTimeout(
      () =>
        this.navigateService.navigateMconfigQueryFilters(
          newMconfig.mconfig_id,
          newQuery.query_id
        ),
      1
    );
  }

  dispatchData(newMconfig: api.Mconfig, newQuery: api.Query) {
    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(new actions.UpdateQueriesStateAction([newQuery]));
    this.store.dispatch(
      new actions.CreateMconfigAndQueryAction({
        mconfig: newMconfig,
        query: newQuery
      })
    );
  }

  goToFile(fieldFileName: string, fieldLineNum: number): void {
    event.stopPropagation();

    let files: api.CatalogFile[] = [];
    this.store
      .select(selectors.getSelectedProjectModeRepoFiles)
      .pipe(take(1))
      .subscribe(x => (files = x));

    let file = files.find(f => f.name === fieldFileName);

    this.navigateService.navigateToFileLine(file.file_id, fieldLineNum);
  }

  isChartPartValid(chart: api.Chart) {
    switch (chart.type) {
      case api.ChartTypeEnum.Table: {
        return true;

        // break;
      }

      case api.ChartTypeEnum.BarVertical: {
        if (chart.x_field && chart.y_field) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontal: {
        if (chart.x_field && chart.y_field) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalGrouped: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalGrouped: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalStacked: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalStacked: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalNormalized: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalNormalized: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Pie: {
        if (chart.x_field && chart.y_field) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.PieAdvanced: {
        if (chart.x_field && chart.y_field) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.PieGrid: {
        if (chart.x_field && chart.y_field) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.Line: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Area: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.AreaStacked: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.AreaNormalized: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.HeatMap: {
        if (chart.x_field && chart.y_fields.length > 0) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.TreeMap: {
        if (chart.x_field && chart.y_field) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.NumberCard: {
        if (chart.y_field) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Gauge: {
        if (chart.x_field && chart.y_field) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.GaugeLinear: {
        if (chart.value_field) {
          return true;
        }

        break;
      }

      default: {
        return false;
      }
    }
  }
}
