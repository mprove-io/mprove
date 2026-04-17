import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy';
import type {
  ColumnCombinedReference,
  CombinedSchemaItem
} from '#common/zod/backend/connection-schemas/combined-schema';
import type { RawSchemaForeignKey } from '#common/zod/backend/connection-schemas/raw-schema';
import type { ToBackendGetConnectionSampleResponse } from '#common/zod/to-backend/connections/to-backend-get-connection-sample';
import type {
  ToBackendGetConnectionSchemasRequestPayload,
  ToBackendGetConnectionSchemasResponse
} from '#common/zod/to-backend/connections/to-backend-get-connection-schemas';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';
import { SampleDialogData } from './sample-dialog/sample-dialog.component';
import { SchemaGraphDialogData } from './schema-graph-dialog/schema-graph-dialog.component';

let SCHEMAS_SPINNER_NAME = 'schemasRefresh';

interface SchemaTreeNode {
  id: string;
  name: string;
  searchName: string;
  children?: SchemaTreeNode[];
  nodeType: 'connection' | 'table' | 'column' | 'index' | 'error';
  connectionId?: string;
  schemaDisplayName?: string;
  tableName?: string;
  tableType?: string;
  columnName?: string;
  dataType?: string;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeys?: RawSchemaForeignKey[];
  references?: ColumnCombinedReference[];
  description?: string;
  example?: string;
  errorMessage?: string;
}

@Component({
  standalone: false,
  selector: 'm-schemas',
  templateUrl: './schemas.component.html',
  styleUrls: ['schemas.component.scss']
})
export class SchemasComponent implements OnInit {
  schemasLoaded = false;
  isRefreshing = false;
  spinnerName = SCHEMAS_SPINNER_NAME;
  treeNodes: SchemaTreeNode[] = [];
  filteredTreeNodes: SchemaTreeNode[] = [];
  combinedSchemaItems: CombinedSchemaItem[] = [];

  searchWord: string;
  searchTimer: any;
  showIndexes = false;
  showQuestionMarks = false;

  prevBranchId: string;
  prevEnvId: string;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;

      let navChanged =
        isDefined(this.prevEnvId) &&
        isDefined(this.prevBranchId) &&
        (this.prevEnvId !== this.nav.envId ||
          this.prevBranchId !== this.nav.branchId);

      this.prevEnvId = this.nav.envId;
      this.prevBranchId = this.nav.branchId;

      this.cd.detectChanges();

      if (navChanged) {
        this.loadSchemas({ isRefreshExistingCache: false });
      }
    })
  );

  actionMapping: IActionMapping = {
    mouse: {}
  };

  treeOptions = {
    actionMapping: this.actionMapping,
    displayField: 'name'
  };

  @ViewChild('itemsTree') itemsTree: TreeComponent;

  constructor(
    private navQuery: NavQuery,
    private apiService: ApiService,
    private myDialogService: MyDialogService,
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadSchemas({ isRefreshExistingCache: false });
  }

  loadSchemas(item: { isRefreshExistingCache: boolean }) {
    let { isRefreshExistingCache } = item;

    let nav = this.navQuery.getValue();

    let payload: ToBackendGetConnectionSchemasRequestPayload = {
      projectId: nav.projectId,
      envId: nav.envId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      isRefreshExistingCache: isRefreshExistingCache
    };

    this.isRefreshing = true;
    this.spinner.show(SCHEMAS_SPINNER_NAME);
    this.cd.detectChanges();

    this.apiService
      .req({
        pathInfoName:
          ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetConnectionSchemasResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.combinedSchemaItems = resp.payload.combinedSchemaItems;
            this.treeNodes = this.buildTreeNodes({
              combinedSchemaItems: this.combinedSchemaItems
            });
            this.applyFilter();
          }

          this.isRefreshing = false;
          this.spinner.hide(SCHEMAS_SPINNER_NAME);
          this.schemasLoaded = true;
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  nodeOnClick(item: { node: TreeNode }) {
    let { node } = item;
    if (node.hasChildren) {
      node.toggleExpanded();
    }
  }

  searchWordChange() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.applyFilter();
      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.searchWord = undefined;
    this.applyFilter();
    this.cd.detectChanges();
  }

  toggleQuestionMarks() {
    this.showQuestionMarks = !this.showQuestionMarks;
  }

  toggleIndexes() {
    this.showIndexes = !this.showIndexes;
    this.applyFilter();
    this.cd.detectChanges();
  }

  applyFilter() {
    let nodes: SchemaTreeNode[] = makeCopy(this.treeNodes);

    if (!this.showIndexes) {
      nodes = this.removeIndexNodes({ nodes: nodes });
    }

    if (isDefinedAndNotEmpty(this.searchWord)) {
      nodes = nodes.filter(node =>
        this.filterNode({ node: node, term: this.searchWord })
      );
    }

    this.filteredTreeNodes = nodes;
  }

  removeIndexNodes(item: { nodes: SchemaTreeNode[] }): SchemaTreeNode[] {
    let { nodes } = item;
    return nodes.map(node => {
      if (node.children) {
        node.children = this.removeIndexNodes({ nodes: node.children }).filter(
          child => child.nodeType !== 'index'
        );
      }
      return node;
    });
  }

  filterNode(item: { node: SchemaTreeNode; term: string }): boolean {
    let { node, term } = item;

    let selfMatch =
      node.nodeType === 'column' &&
      this.schemaSearchFn({
        term: term,
        searchName: node.searchName
      });

    if (node.children?.length > 0) {
      node.children = node.children.filter(child =>
        this.filterNode({ node: child, term: term })
      );
      return selfMatch || node.children.length > 0;
    }

    return selfMatch;
  }

  schemaSearchFn(item: { term: string; searchName: string }): boolean {
    let { term, searchName } = item;
    let haystack = [searchName];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);
    return idxs != null && idxs.length > 0;
  }

  buildTreeNodes(item: {
    combinedSchemaItems: CombinedSchemaItem[];
  }): SchemaTreeNode[] {
    let { combinedSchemaItems } = item;

    let nodes: SchemaTreeNode[] = [];

    combinedSchemaItems.forEach(cs => {
      if (isDefined(cs.errorMessage)) {
        nodes.push({
          id: `${cs.connectionId}__error`,
          name: `${cs.connectionId} - Error: ${cs.errorMessage}`,
          searchName: cs.connectionId,
          nodeType: 'error',
          errorMessage: cs.errorMessage
        });
        return;
      }

      cs.schemas.forEach(combinedSchema => {
        let schemaName = combinedSchema.schemaName;

        let connectionNode: SchemaTreeNode = {
          id: `${cs.connectionId}__${schemaName}`,
          name: `${cs.connectionId} - ${schemaName}`,
          searchName: `${cs.connectionId} ${schemaName}`,
          nodeType: 'connection',
          connectionId: cs.connectionId,
          schemaDisplayName: schemaName,
          description: combinedSchema.description,
          children: combinedSchema.tables.map(table => {
            let columnChildren: SchemaTreeNode[] = table.columns.map(
              (col, colIdx) => ({
                id: `${cs.connectionId}__${schemaName}__${table.tableName}__col__${colIdx}`,
                name: col.columnName,
                searchName: col.columnName,
                nodeType: 'column' as const,
                connectionId: cs.connectionId,
                schemaDisplayName: schemaName,
                tableName: table.tableName,
                columnName: col.columnName,
                dataType: col.dataType,
                isNullable: col.isNullable,
                isPrimaryKey: col.isPrimaryKey,
                isUnique: col.isUnique,
                foreignKeys: col.foreignKeys,
                references: col.references,
                description: col.description,
                example: col.example
              })
            );

            let indexChildren: SchemaTreeNode[] = table.indexes.map(
              (idx, idxIdx) => {
                let label = idx.isPrimaryKey
                  ? `${idx.indexName} (PRIMARY)`
                  : idx.isUnique
                    ? `${idx.indexName} (UNIQUE)`
                    : idx.indexName;

                return {
                  id: `${cs.connectionId}__${schemaName}__${table.tableName}__idx__${idxIdx}`,
                  name: `${label}: ${idx.indexColumns.join(', ')}`,
                  searchName: idx.indexName,
                  nodeType: 'index' as const
                };
              }
            );

            let tableNode: SchemaTreeNode = {
              id: `${cs.connectionId}__${schemaName}__${table.tableName}`,
              name: table.tableName,
              searchName: table.tableName,
              nodeType: 'table' as const,
              connectionId: cs.connectionId,
              schemaDisplayName: schemaName,
              tableName: table.tableName,
              tableType: table.tableType,
              description: table.description,
              children: [...columnChildren, ...indexChildren]
            };

            return tableNode;
          })
        };

        nodes.push(connectionNode);
      });
    });

    nodes.sort((a, b) => a.name.localeCompare(b.name));

    return nodes;
  }

  graphAllOnClick() {
    let nav = this.navQuery.getValue();

    let dialogData: SchemaGraphDialogData = {
      combinedSchemaItems: this.combinedSchemaItems,
      connectionId: undefined,
      schemaName: undefined,
      tableName: undefined,
      projectId: nav.projectId,
      envId: nav.envId
    };

    this.myDialogService.showSchemaGraphDialog(dialogData);
  }

  graphOnClick(item: { node: TreeNode; event: MouseEvent }) {
    let { node, event } = item;
    event.stopPropagation();

    let data = node.data as SchemaTreeNode;
    let nav = this.navQuery.getValue();

    let dialogData: SchemaGraphDialogData = {
      combinedSchemaItems: this.combinedSchemaItems,
      connectionId: data.connectionId,
      schemaName: data.schemaDisplayName,
      tableName: undefined,
      projectId: nav.projectId,
      envId: nav.envId
    };

    this.myDialogService.showSchemaGraphDialog(dialogData);
  }

  copyToClipboard(item: { text: string; event: MouseEvent }) {
    let { text, event } = item;
    event.stopPropagation();
    navigator.clipboard.writeText(text);
  }

  sampleOnClick(item: { node: TreeNode; event: MouseEvent }) {
    let { node, event } = item;
    event.stopPropagation();

    let data = node.data as SchemaTreeNode;

    let isColumn = data.nodeType === 'column';
    let title = `${data.connectionId} - ${data.schemaDisplayName}`;
    let subtitle = data.tableName;

    let nav = this.navQuery.getValue();

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample,
        payload: {
          projectId: nav.projectId,
          envId: nav.envId,
          connectionId: data.connectionId,
          schemaName: data.schemaDisplayName,
          tableName: data.tableName,
          columnName: isColumn ? data.columnName : undefined
        }
      })
      .pipe(
        map((resp: ToBackendGetConnectionSampleResponse) => {
          let dialogData: SampleDialogData = {
            title: title,
            subtitle: subtitle,
            columnNames: [],
            rows: [],
            errorMessage: undefined,
            projectId: nav.projectId,
            envId: nav.envId,
            connectionId: data.connectionId,
            schemaName: data.schemaDisplayName,
            tableName: data.tableName,
            columnName: isColumn ? data.columnName : undefined
          };

          if (
            resp.info?.status === ResponseInfoStatusEnum.Ok &&
            isDefined(resp.payload.errorMessage)
          ) {
            dialogData.errorMessage = resp.payload.errorMessage;
          } else if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            dialogData.columnNames = resp.payload.columnNames;
            dialogData.rows = resp.payload.rows;
          } else {
            dialogData.errorMessage = 'Failed to fetch sample data';
          }

          this.myDialogService.showSample(dialogData);
        }),
        take(1)
      )
      .subscribe();
  }
}
