import {
  IActionMapping,
  TreeComponent,
  TreeNode
} from '@ali-hm/angular-tree-component';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take } from 'rxjs/operators';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { makeCopy } from '#common/functions/make-copy';
import {
  ConnectionSchemaItem,
  SchemaForeignKey,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';
import {
  ToBackendGetConnectionSchemasRequestPayload,
  ToBackendGetConnectionSchemasResponse
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-schemas';
import { NavQuery } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';

let SCHEMAS_SPINNER_NAME = 'schemasRefresh';

interface SchemaTreeNode {
  id: string;
  name: string;
  searchName: string;
  children?: SchemaTreeNode[];
  nodeType: 'connection' | 'table' | 'column' | 'index' | 'error';
  connectionId?: string;
  schemaDisplayName?: string;
  tableType?: string;
  columnName?: string;
  dataType?: string;
  isNullable?: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeys?: SchemaForeignKey[];
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
  connectionSchemaItems: ConnectionSchemaItem[] = [];

  searchWord: string;
  searchTimer: any;
  showIndexes = false;

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
    private cd: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadSchemas();
  }

  loadSchemas() {
    let nav = this.navQuery.getValue();

    let payload: ToBackendGetConnectionSchemasRequestPayload = {
      projectId: nav.projectId,
      envId: nav.envId,
      isRefresh: true
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
            this.connectionSchemaItems = resp.payload.connectionSchemaItems;
            this.treeNodes = this.buildTreeNodes({
              connectionSchemaItems: this.connectionSchemaItems
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

    let selfMatch = this.schemaSearchFn({
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
    connectionSchemaItems: ConnectionSchemaItem[];
  }): SchemaTreeNode[] {
    let { connectionSchemaItems } = item;

    let nodes: SchemaTreeNode[] = [];

    connectionSchemaItems.forEach(cs => {
      let schema = cs.schema;

      if (isDefined(schema.errorMessage)) {
        nodes.push({
          id: `${cs.connectionId}__error`,
          name: `${cs.connectionId} - Error: ${schema.errorMessage}`,
          searchName: cs.connectionId,
          nodeType: 'error',
          errorMessage: schema.errorMessage
        });
        return;
      }

      let schemaGroups = new Map<string, SchemaTable[]>();

      schema.tables.forEach(t => {
        let key = t.schemaName;
        let group = schemaGroups.get(key);
        if (!group) {
          group = [];
          schemaGroups.set(key, group);
        }
        group.push(t);
      });

      schemaGroups.forEach((tables, schemaName) => {
        let connectionNode: SchemaTreeNode = {
          id: `${cs.connectionId}__${schemaName}`,
          name: `${cs.connectionId} - ${schemaName.charAt(0).toUpperCase() + schemaName.slice(1)}`,
          searchName: `${cs.connectionId} ${schemaName}`,
          nodeType: 'connection',
          connectionId: cs.connectionId,
          schemaDisplayName:
            schemaName.charAt(0).toUpperCase() + schemaName.slice(1),
          children: tables.map(table => {
            let columnChildren: SchemaTreeNode[] = table.columns.map(
              (col, colIdx) => ({
                id: `${cs.connectionId}__${schemaName}__${table.tableName}__col__${colIdx}`,
                name: col.columnName,
                searchName: col.columnName,
                nodeType: 'column' as const,
                columnName: col.columnName,
                dataType: col.dataType,
                isNullable: col.isNullable,
                isPrimaryKey: col.isPrimaryKey,
                isUnique: col.isUnique,
                foreignKeys: col.foreignKeys
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

            return {
              id: `${cs.connectionId}__${schemaName}__${table.tableName}`,
              name: table.tableName,
              searchName: table.tableName,
              nodeType: 'table' as const,
              tableType: table.tableType,
              children: [...columnChildren, ...indexChildren]
            };
          })
        };

        nodes.push(connectionNode);
      });
    });

    return nodes;
  }
}
