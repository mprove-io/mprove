import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
  WritableSignal
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Edge, Node, Vflow, VflowComponent } from 'ngx-vflow';
import { map, take } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ConnectionSchemaItem,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
import { ToBackendGetConnectionSampleResponse } from '#common/interfaces/to-backend/connections/to-backend-get-connection-sample';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../../../../shared/shared.module';
import {
  buildAllTablesGraph,
  GraphTable,
  MapEdgeData,
  MapGraphResult,
  MapNodeData,
  tableKey
} from './schema-graph-builder';

export interface SchemaGraphDialogData {
  connectionSchemaItems: ConnectionSchemaItem[];
  connectionId: string;
  schemaName: string;
  tableName: string;
  projectId: string;
  envId: string;
}

interface SchemaGraphSchemaNode {
  connectionId: string;
  schemaName: string;
  expanded: boolean;
  tables: SchemaGraphTableNode[];
}

interface SchemaGraphTableNode {
  tableFullId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  checked: boolean;
}

@Component({
  selector: 'm-schema-graph-dialog',
  templateUrl: './schema-graph-dialog.component.html',
  styleUrls: ['./schema-graph-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    TippyDirective,
    ...Vflow,
    NgScrollbarModule,
    NgxSpinnerModule
  ]
})
export class SchemaGraphDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild(VflowComponent) vflowRef: VflowComponent;

  dataItem = this.ref.data;

  nodes: Node[] = [];
  edges: Edge[] = [];
  currentSchemaName: string;
  currentTableName: string;
  selectedTableKey: string;
  hoveredTableKey: string;
  selectedColumnKey: string;

  nodeDataSignals: Map<string, WritableSignal<MapNodeData>> = new Map();
  edgeDataSignals: Map<string, WritableSignal<MapEdgeData>> = new Map();
  edgesByTable: Map<string, Set<string>> = new Map();

  graphLoading = true;
  graphOverlay = true;
  showNodeSubtitle = false;
  showIndexes = false;

  showSample = false;
  sampleTitle = '';
  sampleSubtitle = '';
  sampleColumnNames: string[] = [];
  sampleRows: string[][] = [];
  sampleErrorMessage: string;
  sampleIsLoading = false;

  sampleSpinnerName = 'mapSample';

  schemaNodes: SchemaGraphSchemaNode[] = [];

  constructor(
    public ref: DialogRef<SchemaGraphDialogData>,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    if (this.dataItem.tableName) {
      this.currentTableName = this.dataItem.tableName;
    }
    if (this.dataItem.schemaName) {
      this.currentSchemaName = this.dataItem.schemaName;
    }

    this.buildSchemaTree();
    this.initGraph();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  buildSchemaTree() {
    let groupKey = (item: { connectionId: string; schemaName: string }) =>
      `${item.connectionId}__${item.schemaName}`;

    let schemaGroups = new Map<
      string,
      { connectionId: string; schemaName: string; tables: SchemaTable[] }
    >();

    for (let csItem of this.dataItem.connectionSchemaItems) {
      for (let table of csItem.schema.tables) {
        let key = groupKey({
          connectionId: csItem.connectionId,
          schemaName: table.schemaName
        });
        let group = schemaGroups.get(key);
        if (!group) {
          group = {
            connectionId: csItem.connectionId,
            schemaName: table.schemaName,
            tables: []
          };
          schemaGroups.set(key, group);
        }
        group.tables.push(table);
      }
    }

    this.schemaNodes = [];

    schemaGroups.forEach(group => {
      let tableNodes: SchemaGraphTableNode[] = group.tables
        .map(t => ({
          tableFullId: tableKey({
            connectionId: group.connectionId,
            schemaName: t.schemaName,
            tableName: t.tableName
          }),
          connectionId: group.connectionId,
          schemaName: t.schemaName,
          tableName: t.tableName,
          checked:
            group.connectionId === this.dataItem.connectionId &&
            group.schemaName === this.dataItem.schemaName
        }))
        .sort((a, b) => a.tableName.localeCompare(b.tableName));

      this.schemaNodes.push({
        connectionId: group.connectionId,
        schemaName: group.schemaName,
        expanded:
          group.connectionId === this.dataItem.connectionId &&
          group.schemaName === this.dataItem.schemaName,
        tables: tableNodes
      });
    });

    this.schemaNodes.sort((a, b) =>
      `${a.connectionId} - ${a.schemaName}`.localeCompare(
        `${b.connectionId} - ${b.schemaName}`
      )
    );
  }

  getCheckedTables(): GraphTable[] {
    let checkedKeys = new Set<string>();
    for (let schemaNode of this.schemaNodes) {
      for (let tableNode of schemaNode.tables) {
        if (tableNode.checked) {
          checkedKeys.add(tableNode.tableFullId);
        }
      }
    }

    let allTables: GraphTable[] = [];
    for (let csItem of this.dataItem.connectionSchemaItems) {
      for (let table of csItem.schema.tables) {
        let fullId = tableKey({
          connectionId: csItem.connectionId,
          schemaName: table.schemaName,
          tableName: table.tableName
        });
        if (checkedKeys.has(fullId)) {
          allTables.push({
            ...table,
            tableFullId: fullId,
            connectionId: csItem.connectionId
          });
        }
      }
    }

    return allTables;
  }

  updateShowNodeSubtitle(item: { checkedTables: GraphTable[] }) {
    let { checkedTables } = item;
    let connectionSchemaKeys = new Set<string>();
    for (let table of checkedTables) {
      connectionSchemaKeys.add(`${table.connectionId}__${table.schemaName}`);
    }
    this.showNodeSubtitle = connectionSchemaKeys.size > 1;
  }

  toggleIndexes() {
    this.showIndexes = !this.showIndexes;
    this.rebuildGraph();
  }

  toggleSchemaExpanded(item: { schemaNode: SchemaGraphSchemaNode }) {
    let { schemaNode } = item;
    schemaNode.expanded = !schemaNode.expanded;
  }

  isSchemaAllChecked(item: { schemaNode: SchemaGraphSchemaNode }): boolean {
    let { schemaNode } = item;
    return schemaNode.tables.every(t => t.checked);
  }

  isSchemaSomeChecked(item: { schemaNode: SchemaGraphSchemaNode }): boolean {
    let { schemaNode } = item;
    let someChecked = schemaNode.tables.some(t => t.checked);
    let allChecked = schemaNode.tables.every(t => t.checked);
    return someChecked && !allChecked;
  }

  toggleSchema(item: { schemaNode: SchemaGraphSchemaNode }) {
    let { schemaNode } = item;
    let allChecked = this.isSchemaAllChecked({ schemaNode: schemaNode });
    let newValue = !allChecked;
    for (let tableNode of schemaNode.tables) {
      tableNode.checked = newValue;
    }
    this.rebuildGraph();
  }

  toggleTable(item: { tableNode: SchemaGraphTableNode }) {
    let { tableNode } = item;
    tableNode.checked = !tableNode.checked;
    this.rebuildGraph();
  }

  async rebuildGraph() {
    this.graphOverlay = true;
    this.graphLoading = true;
    this.cd.detectChanges();

    let checkedTables = this.getCheckedTables();
    this.updateShowNodeSubtitle({ checkedTables });

    if (checkedTables.length === 0) {
      this.nodes = [];
      this.edges = [];
      this.nodeDataSignals = new Map();
      this.edgeDataSignals = new Map();
      this.edgesByTable = new Map();

      if (this.selectedTableKey) {
        this.selectedTableKey = undefined;
        this.showSample = false;
      }

      this.graphLoading = false;
      this.graphOverlay = false;
      this.cd.detectChanges();
      return;
    }

    let result: MapGraphResult = await buildAllTablesGraph({
      tables: checkedTables,
      showIndexes: this.showIndexes,
      onSelect: selectItem => {
        this.selectTable(selectItem);
      },
      onHover: hoverItem => {
        this.highlightTable({ tableKey: hoverItem.tableFullId });
      },
      onUnhover: unhoverItem => {
        this.unhighlightTable({ tableKey: unhoverItem.tableFullId });
      },
      onTableSampleToggle: sampleItem => {
        this.toggleTableSample(sampleItem);
      },
      onColumnSampleToggle: colItem => {
        this.toggleColumnSample(colItem);
      }
    });

    this.nodes = result.nodes;
    this.edges = result.edges;
    this.nodeDataSignals = result.nodeDataSignals;
    this.edgeDataSignals = result.edgeDataSignals;
    this.edgesByTable = result.edgesByTable;

    // Re-apply selection if still visible, else clear
    if (this.selectedTableKey) {
      let hasSelected = this.nodeDataSignals.has(this.selectedTableKey);
      if (hasSelected) {
        this.updateSelection({ tableKey: this.selectedTableKey });
      } else {
        this.selectedTableKey = undefined;
        this.showSample = false;
      }
    }

    this.graphLoading = false;
    this.cd.detectChanges();

    setTimeout(() => {
      if (this.vflowRef) {
        this.vflowRef.fitView();
      }
      setTimeout(() => {
        this.graphOverlay = false;
        this.cd.detectChanges();
      }, 100);
    }, 200);
  }

  async initGraph() {
    let checkedTables = this.getCheckedTables();
    this.updateShowNodeSubtitle({ checkedTables });

    let result: MapGraphResult = await buildAllTablesGraph({
      tables: checkedTables,
      showIndexes: this.showIndexes,
      onSelect: selectItem => {
        this.selectTable(selectItem);
      },
      onHover: hoverItem => {
        this.highlightTable({ tableKey: hoverItem.tableFullId });
      },
      onUnhover: unhoverItem => {
        this.unhighlightTable({ tableKey: unhoverItem.tableFullId });
      },
      onTableSampleToggle: sampleItem => {
        this.toggleTableSample(sampleItem);
      },
      onColumnSampleToggle: colItem => {
        this.toggleColumnSample(colItem);
      }
    });

    this.nodes = result.nodes;
    this.edges = result.edges;
    this.nodeDataSignals = result.nodeDataSignals;
    this.edgeDataSignals = result.edgeDataSignals;
    this.edgesByTable = result.edgesByTable;

    if (this.dataItem.tableName && this.dataItem.schemaName) {
      let fullId = tableKey({
        connectionId: this.dataItem.connectionId,
        schemaName: this.dataItem.schemaName,
        tableName: this.dataItem.tableName
      });
      this.updateSelection({ tableKey: fullId });
    }

    this.graphLoading = false;
    this.cd.detectChanges();

    setTimeout(() => {
      if (this.vflowRef) {
        this.vflowRef.fitView();
      }
      setTimeout(() => {
        this.graphOverlay = false;
        this.cd.detectChanges();
      }, 100);
    }, 200);
  }

  updateSelection(item: { tableKey: string }) {
    let { tableKey } = item;

    // Unhighlight previous selection
    if (this.selectedTableKey) {
      let prevNodeSignal = this.nodeDataSignals.get(this.selectedTableKey);
      if (prevNodeSignal) {
        let prevData = prevNodeSignal();
        prevNodeSignal.set({ ...prevData, color: 'gray' });
      }
    }

    // Highlight new selection
    this.selectedTableKey = tableKey;

    let newNodeSignal = this.nodeDataSignals.get(tableKey);
    if (newNodeSignal) {
      let newData = newNodeSignal();
      this.currentSchemaName = newData.schemaName;
      this.currentTableName = newData.tableName;
      newNodeSignal.set({ ...newData, color: 'orange' });
    }

    this.cd.detectChanges();
  }

  highlightTable(item: { tableKey: string }) {
    let { tableKey } = item;

    // Unhighlight previous hover
    if (this.hoveredTableKey) {
      this.unhighlightTable({ tableKey: this.hoveredTableKey });
    }

    this.hoveredTableKey = tableKey;

    let edgeIds = this.edgesByTable.get(tableKey);
    if (edgeIds) {
      for (let edgeId of edgeIds) {
        let edgeSignal = this.edgeDataSignals.get(edgeId);
        if (edgeSignal) {
          let edgeData = edgeSignal();
          edgeSignal.set({ ...edgeData, highlighted: true });
        }
      }
    }

    this.cd.detectChanges();
  }

  unhighlightTable(item: { tableKey: string }) {
    let { tableKey } = item;

    let edgeIds = this.edgesByTable.get(tableKey);
    if (edgeIds) {
      for (let edgeId of edgeIds) {
        let edgeSignal = this.edgeDataSignals.get(edgeId);
        if (edgeSignal) {
          let edgeData = edgeSignal();
          edgeSignal.set({ ...edgeData, highlighted: false });
        }
      }
    }

    if (this.hoveredTableKey === tableKey) {
      this.hoveredTableKey = undefined;
    }

    this.cd.detectChanges();
  }

  selectTable(item: {
    tableFullId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
  }) {
    let { tableFullId, connectionId, schemaName, tableName } = item;

    // Deselect column if selected
    if (this.selectedColumnKey) {
      let prevTableKey = this.selectedColumnKey.split('::')[0];
      this.updateSelectedColumn({
        tableKey: prevTableKey,
        columnName: undefined
      });
      this.selectedColumnKey = undefined;
    }

    let isAlreadySelected = this.selectedTableKey === tableFullId;
    if (isAlreadySelected) {
      this.deselectTable();
      return;
    }

    this.updateSelection({ tableKey: tableFullId });
    this.fetchSample({
      connectionId: connectionId,
      schemaName: schemaName,
      tableName: tableName,
      columnName: undefined
    });
  }

  deselectTable() {
    if (this.selectedTableKey) {
      let prevNodeSignal = this.nodeDataSignals.get(this.selectedTableKey);
      if (prevNodeSignal) {
        let prevData = prevNodeSignal();
        prevNodeSignal.set({ ...prevData, color: 'gray' });
      }
    }

    this.selectedTableKey = undefined;
    this.showSample = false;
    this.cd.detectChanges();
  }

  toggleTableSample(item: {
    tableFullId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
  }) {
    let { connectionId, schemaName, tableName } = item;
    this.fetchSample({
      connectionId: connectionId,
      schemaName: schemaName,
      tableName: tableName,
      columnName: undefined
    });
  }

  toggleColumnSample(item: {
    tableFullId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
  }) {
    let { tableFullId, connectionId, schemaName, tableName, columnName } = item;

    // Deselect table if selected
    if (this.selectedTableKey) {
      let prevNodeSignal = this.nodeDataSignals.get(this.selectedTableKey);
      if (prevNodeSignal) {
        let prevData = prevNodeSignal();
        prevNodeSignal.set({ ...prevData, color: 'gray' });
      }
      this.selectedTableKey = undefined;
    }

    let columnKey = `${tableFullId}::${columnName}`;
    let isAlreadySelected = this.selectedColumnKey === columnKey;
    if (isAlreadySelected) {
      this.updateSelectedColumn({
        tableKey: tableFullId,
        columnName: undefined
      });
      this.selectedColumnKey = undefined;
      this.showSample = false;
      this.cd.detectChanges();
      return;
    }

    // Clear previous column selection if on a different table
    if (this.selectedColumnKey) {
      let prevTableKey = this.selectedColumnKey.split('::')[0];
      this.updateSelectedColumn({
        tableKey: prevTableKey,
        columnName: undefined
      });
    }

    this.updateSelectedColumn({
      tableKey: tableFullId,
      columnName: columnName
    });
    this.selectedColumnKey = columnKey;
    this.fetchSample({
      connectionId: connectionId,
      schemaName: schemaName,
      tableName: tableName,
      columnName: columnName
    });
  }

  updateSelectedColumn(item: { tableKey: string; columnName: string }) {
    let { tableKey, columnName } = item;

    let nodeSignal = this.nodeDataSignals.get(tableKey);
    if (nodeSignal) {
      let data = nodeSignal();
      nodeSignal.set({ ...data, selectedColumnName: columnName });
    }
  }

  fetchSample(item: {
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
  }) {
    let { connectionId, schemaName, tableName, columnName } = item;

    this.sampleIsLoading = true;
    this.showSample = true;
    this.sampleTitle = `${connectionId} - ${schemaName}`;
    this.sampleSubtitle = tableName;
    this.sampleColumnNames = [];
    this.sampleRows = [];
    this.sampleErrorMessage = undefined;
    this.spinner.show(this.sampleSpinnerName);
    this.cd.detectChanges();

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample,
        payload: {
          projectId: this.dataItem.projectId,
          envId: this.dataItem.envId,
          connectionId: connectionId,
          schemaName: schemaName,
          tableName: tableName,
          columnName: columnName
        }
      })
      .pipe(
        map((resp: ToBackendGetConnectionSampleResponse) => {
          setTimeout(() => {
            if (
              resp.info?.status === ResponseInfoStatusEnum.Ok &&
              isDefined(resp.payload.errorMessage)
            ) {
              this.sampleErrorMessage = resp.payload.errorMessage;
            } else if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              this.sampleColumnNames = resp.payload.columnNames;
              this.sampleRows = resp.payload.rows;
              this.sampleErrorMessage = undefined;
            } else {
              this.sampleErrorMessage = 'Failed to fetch sample data';
            }

            this.sampleIsLoading = false;
            this.spinner.hide(this.sampleSpinnerName);
            this.cd.detectChanges();
          }, 0);
        }),
        take(1)
      )
      .subscribe();
  }

  findTableNode(item: { tableFullId: string }): SchemaGraphTableNode {
    for (let schemaNode of this.schemaNodes) {
      for (let tableNode of schemaNode.tables) {
        if (tableNode.tableFullId === item.tableFullId) {
          return tableNode;
        }
      }
    }
    return undefined;
  }

  async centerOnTable(item: {
    tableFullId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
  }) {
    let { tableFullId, connectionId, schemaName, tableName } = item;

    // Check and rebuild if table is unchecked
    let tableNode = this.findTableNode({ tableFullId });
    if (tableNode && !tableNode.checked) {
      tableNode.checked = true;
      await this.rebuildGraph();
    }

    let hasNode = this.nodeDataSignals.has(tableFullId);
    if (!hasNode || !this.vflowRef) {
      return;
    }

    let connectedNodes = new Set<string>([tableFullId]);
    for (let edge of this.edges) {
      if (edge.source === tableFullId) {
        connectedNodes.add(edge.target);
      } else if (edge.target === tableFullId) {
        connectedNodes.add(edge.source);
      }
    }

    let padding =
      connectedNodes.size <= 1 ? 5 : connectedNodes.size <= 1 ? 2 : 1;

    let isAlreadySelected = this.selectedTableKey === tableFullId;

    this.selectTable({ tableFullId, connectionId, schemaName, tableName });

    if (!isAlreadySelected) {
      this.vflowRef.fitView({
        nodes: [...connectedNodes],
        padding: padding,
        duration: 300
      });
    }
  }

  closeSample() {
    this.showSample = false;
    this.cd.detectChanges();
  }
}
