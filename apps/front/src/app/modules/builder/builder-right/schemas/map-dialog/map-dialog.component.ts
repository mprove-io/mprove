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
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Edge, Node, Vflow, VflowComponent } from 'ngx-vflow';
import { map, take } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ConnectionSchemaItem } from '#common/interfaces/backend/connection-schema';
import { ToBackendGetConnectionSampleResponse } from '#common/interfaces/to-backend/connections/to-backend-get-connection-sample';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../../../../shared/shared.module';
import {
  buildAllTablesGraph,
  MapEdgeData,
  MapGraphResult,
  MapNodeData
} from './map-graph-builder';

export interface MapDialogData {
  connectionSchemaItems: ConnectionSchemaItem[];
  connectionId: string;
  schemaName: string;
  tableName: string;
  projectId: string;
  envId: string;
}

@Component({
  selector: 'm-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ...Vflow,
    NgScrollbarModule,
    NgxSpinnerModule
  ]
})
export class MapDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  @ViewChild(VflowComponent) vflowRef: VflowComponent;

  dataItem = this.ref.data;

  nodes: Node[] = [];
  edges: Edge[] = [];
  currentTableName: string;
  selectedTableName: string;
  hoveredTableName: string;
  selectedColumnKey: string;

  nodeDataSignals: Map<string, WritableSignal<MapNodeData>> = new Map();
  edgeDataSignals: Map<string, WritableSignal<MapEdgeData>> = new Map();
  edgesByTable: Map<string, Set<string>> = new Map();

  graphLoading = true;
  graphOverlay = true;

  showSample = false;
  sampleTitle = '';
  sampleSubtitle = '';
  sampleColumnNames: string[] = [];
  sampleRows: string[][] = [];
  sampleErrorMessage: string;
  sampleIsLoading = false;

  sampleSpinnerName = 'mapSample';

  constructor(
    public ref: DialogRef<MapDialogData>,
    private apiService: ApiService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    if (this.dataItem.tableName) {
      this.currentTableName = this.dataItem.tableName;
    }

    this.initGraph();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  async initGraph() {
    let result: MapGraphResult = await buildAllTablesGraph({
      connectionSchemaItems: this.dataItem.connectionSchemaItems,
      connectionId: this.dataItem.connectionId,
      schemaName: this.dataItem.schemaName,
      onSelect: (selectItem: { tableName: string }) => {
        this.selectTable({ tableName: selectItem.tableName });
      },
      onHover: (hoverItem: { tableName: string }) => {
        this.highlightTable({ tableName: hoverItem.tableName });
      },
      onUnhover: (unhoverItem: { tableName: string }) => {
        this.unhighlightTable({ tableName: unhoverItem.tableName });
      },
      onTableSampleToggle: (sampleItem: { tableName: string }) => {
        this.toggleTableSample({ tableName: sampleItem.tableName });
      },
      onColumnSampleToggle: (colItem: {
        tableName: string;
        columnName: string;
      }) => {
        this.toggleColumnSample({
          tableName: colItem.tableName,
          columnName: colItem.columnName
        });
      }
    });

    this.nodes = result.nodes;
    this.edges = result.edges;
    this.nodeDataSignals = result.nodeDataSignals;
    this.edgeDataSignals = result.edgeDataSignals;
    this.edgesByTable = result.edgesByTable;

    if (this.dataItem.tableName) {
      this.updateSelection({ tableName: this.dataItem.tableName });
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

  updateSelection(item: { tableName: string }) {
    let { tableName } = item;

    // Unhighlight previous selection
    if (this.selectedTableName) {
      let prevNodeSignal = this.nodeDataSignals.get(this.selectedTableName);
      if (prevNodeSignal) {
        let prevData = prevNodeSignal();
        prevNodeSignal.set({ ...prevData, color: 'gray' });
      }
    }

    // Highlight new selection
    this.selectedTableName = tableName;
    this.currentTableName = tableName;

    let newNodeSignal = this.nodeDataSignals.get(tableName);
    if (newNodeSignal) {
      let newData = newNodeSignal();
      newNodeSignal.set({ ...newData, color: 'orange' });
    }

    this.cd.detectChanges();
  }

  highlightTable(item: { tableName: string }) {
    let { tableName } = item;

    // Unhighlight previous hover
    if (this.hoveredTableName) {
      this.unhighlightTable({ tableName: this.hoveredTableName });
    }

    this.hoveredTableName = tableName;

    let edgeIds = this.edgesByTable.get(tableName);
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

  unhighlightTable(item: { tableName: string }) {
    let { tableName } = item;

    let edgeIds = this.edgesByTable.get(tableName);
    if (edgeIds) {
      for (let edgeId of edgeIds) {
        let edgeSignal = this.edgeDataSignals.get(edgeId);
        if (edgeSignal) {
          let edgeData = edgeSignal();
          edgeSignal.set({ ...edgeData, highlighted: false });
        }
      }
    }

    if (this.hoveredTableName === tableName) {
      this.hoveredTableName = undefined;
    }

    this.cd.detectChanges();
  }

  selectTable(item: { tableName: string }) {
    let { tableName } = item;

    // Deselect column if selected
    if (this.selectedColumnKey) {
      let prevTableName = this.selectedColumnKey.split(':')[0];
      this.updateSelectedColumn({
        tableName: prevTableName,
        columnName: undefined
      });
      this.selectedColumnKey = undefined;
    }

    let isAlreadySelected = this.selectedTableName === tableName;
    if (isAlreadySelected) {
      this.deselectTable();
      return;
    }

    this.updateSelection({ tableName: tableName });
    this.fetchSample({ tableName: tableName, columnName: undefined });
  }

  deselectTable() {
    if (this.selectedTableName) {
      let prevNodeSignal = this.nodeDataSignals.get(this.selectedTableName);
      if (prevNodeSignal) {
        let prevData = prevNodeSignal();
        prevNodeSignal.set({ ...prevData, color: 'gray' });
      }
    }

    this.selectedTableName = undefined;
    this.showSample = false;
    this.cd.detectChanges();
  }

  toggleTableSample(item: { tableName: string }) {
    let { tableName } = item;
    this.fetchSample({ tableName: tableName, columnName: undefined });
  }

  toggleColumnSample(item: { tableName: string; columnName: string }) {
    let { tableName, columnName } = item;

    // Deselect table if selected
    if (this.selectedTableName) {
      let prevNodeSignal = this.nodeDataSignals.get(this.selectedTableName);
      if (prevNodeSignal) {
        let prevData = prevNodeSignal();
        prevNodeSignal.set({ ...prevData, color: 'gray' });
      }
      this.selectedTableName = undefined;
    }

    let columnKey = `${tableName}:${columnName}`;
    let isAlreadySelected = this.selectedColumnKey === columnKey;
    if (isAlreadySelected) {
      this.updateSelectedColumn({
        tableName: tableName,
        columnName: undefined
      });
      this.selectedColumnKey = undefined;
      this.showSample = false;
      this.cd.detectChanges();
      return;
    }

    // Clear previous column selection if on a different table
    if (this.selectedColumnKey) {
      let prevTableName = this.selectedColumnKey.split(':')[0];
      this.updateSelectedColumn({
        tableName: prevTableName,
        columnName: undefined
      });
    }

    this.updateSelectedColumn({
      tableName: tableName,
      columnName: columnName
    });
    this.selectedColumnKey = columnKey;
    this.fetchSample({ tableName: tableName, columnName: columnName });
  }

  updateSelectedColumn(item: { tableName: string; columnName: string }) {
    let { tableName, columnName } = item;

    let nodeSignal = this.nodeDataSignals.get(tableName);
    if (nodeSignal) {
      let data = nodeSignal();
      nodeSignal.set({ ...data, selectedColumnName: columnName });
    }
  }

  fetchSample(item: { tableName: string; columnName: string }) {
    let { tableName, columnName } = item;

    this.sampleIsLoading = true;
    this.showSample = true;
    this.sampleTitle = `${this.dataItem.connectionId} - ${this.dataItem.schemaName}`;
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
          connectionId: this.dataItem.connectionId,
          schemaName: this.dataItem.schemaName,
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

  closeSample() {
    this.showSample = false;
    this.cd.detectChanges();
  }
}
