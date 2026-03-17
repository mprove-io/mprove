import { signal, WritableSignal } from '@angular/core';
import initVizdom, { DirectedGraph, RankDir } from '@vizdom/vizdom-ts-web';
import { Edge, Node } from 'ngx-vflow';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import {
  SchemaColumn,
  SchemaIndex,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';

let NODE_WIDTH = 250;
let HEADER_HEIGHT = 40;
let ROW_HEIGHT = 26;
let NODE_PADDING = 16;

export interface MapNodeData {
  connectionId: string;
  schemaName: string;
  tableName: string;
  columns: SchemaColumn[];
  indexes: SchemaIndex[];
  color: 'orange' | 'gray';
  selectedColumnName: string;
  onSelect: () => void;
  onHover: () => void;
  onUnhover: () => void;
  onTableSampleToggle: () => void;
  onColumnSampleToggle: (item: { columnName: string }) => void;
}

export interface MapEdgeData {
  label: string;
  markerStartId: string;
  markerEndId: string;
  className: string;
  highlighted: boolean;
}

export interface MapGraphResult {
  nodes: Node[];
  edges: Edge[];
  nodeDataSignals: Map<string, WritableSignal<MapNodeData>>;
  edgeDataSignals: Map<string, WritableSignal<MapEdgeData>>;
  edgesByTable: Map<string, Set<string>>;
}

export interface GraphTable extends SchemaTable {
  tableFullId: string;
  connectionId: string;
}

export function tableKey(item: {
  connectionId: string;
  schemaName: string;
  tableName: string;
}): string {
  return `${item.connectionId}__${item.schemaName}__${item.tableName}`;
}

function getEdgeMarkers(item: {
  relationshipType: RelationshipTypeEnum;
  isReversed: boolean;
}): { markerStartId: string; markerEndId: string; className: string } {
  let { relationshipType, isReversed } = item;

  let reversedSuffix = isReversed ? 'Reversed' : '';

  switch (relationshipType) {
    case RelationshipTypeEnum.OneToOne:
      return {
        markerStartId: undefined,
        markerEndId: undefined,
        className: `has-one-edge${isReversed ? '-reversed' : ''}`
      };
    case RelationshipTypeEnum.OneToMany:
      return {
        markerStartId: undefined,
        markerEndId: `hasMany${reversedSuffix}`,
        className: `has-many-edge${isReversed ? '-reversed' : ''}`
      };
    case RelationshipTypeEnum.ManyToOne:
      return {
        markerStartId: `hasMany${reversedSuffix}`,
        markerEndId: undefined,
        className: `has-many-edge${isReversed ? '-reversed' : ''}`
      };
    case RelationshipTypeEnum.ManyToMany:
      return {
        markerStartId: `hasMany${reversedSuffix}`,
        markerEndId: `hasMany${reversedSuffix}`,
        className: `has-many-edge${isReversed ? '-reversed' : ''}`
      };
    default:
      return {
        markerStartId: undefined,
        markerEndId: undefined,
        className: ''
      };
  }
}

function estimateNodeHeight(item: {
  columnCount: number;
  indexCount: number;
}): number {
  let { columnCount, indexCount } = item;
  return HEADER_HEIGHT + (columnCount + indexCount) * ROW_HEIGHT + NODE_PADDING;
}

let vizdomInitialized = false;

async function ensureVizdomInitialized(): Promise<void> {
  if (!vizdomInitialized) {
    await initVizdom({
      module_or_path: '/assets/vizdom/vizdom_ts_bg.wasm'
    });
    vizdomInitialized = true;
  }
}

export async function buildAllTablesGraph(item: {
  tables: GraphTable[];
  showIndexes: boolean;
  onSelect: (item: {
    tableFullId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
  }) => void;
  onHover: (item: { tableFullId: string }) => void;
  onUnhover: (item: { tableFullId: string }) => void;
  onTableSampleToggle: (item: {
    tableFullId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
  }) => void;
  onColumnSampleToggle: (item: {
    tableFullId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
  }) => void;
}): Promise<MapGraphResult> {
  let {
    tables,
    showIndexes,
    onSelect,
    onHover,
    onUnhover,
    onTableSampleToggle,
    onColumnSampleToggle
  } = item;

  let allTables = tables;

  if (allTables.length === 0) {
    return {
      nodes: [],
      edges: [],
      nodeDataSignals: new Map(),
      edgeDataSignals: new Map(),
      edgesByTable: new Map()
    };
  }

  // Build table lookup using composite keys
  let tableMap = new Map<string, GraphTable>();
  allTables.forEach(table => {
    tableMap.set(table.tableFullId, table);
  });

  // Collect all edges (relationships) between tables
  interface EdgeInfo {
    sourceKey: string;
    targetKey: string;
    sourceColumn: string;
    targetColumn: string;
    relationshipType: RelationshipTypeEnum;
    isForeignKey: boolean;
  }

  let edgeInfos: EdgeInfo[] = [];
  let connectedPairs = new Set<string>();

  allTables.forEach(table => {
    let sourceKey = table.tableFullId;

    table.columns.forEach(col => {
      if (col.combinedReferences) {
        col.combinedReferences.forEach(ref => {
          let refSchemaName = ref.referencedSchemaName ?? table.schemaName;
          let targetKey = tableKey({
            connectionId: table.connectionId,
            schemaName: refSchemaName,
            tableName: ref.referencedTableName
          });

          let hasTarget = tableMap.has(targetKey);
          if (!hasTarget) {
            return;
          }
          let isSelfRef = targetKey === sourceKey;
          if (isSelfRef) {
            return;
          }

          let pairKey = `${sourceKey}:${col.columnName}->${targetKey}:${ref.referencedColumnName}`;
          let alreadyAdded = connectedPairs.has(pairKey);
          if (alreadyAdded) {
            return;
          }
          connectedPairs.add(pairKey);

          edgeInfos.push({
            sourceKey: sourceKey,
            targetKey: targetKey,
            sourceColumn: col.columnName,
            targetColumn: ref.referencedColumnName,
            relationshipType: ref.relationshipType,
            isForeignKey: ref.isForeignKey
          });
        });
      }
    });
  });

  // Compute layout with vizdom
  await ensureVizdomInitialized();

  let graph = new DirectedGraph({
    layout: {
      rank_sep: 80,
      node_sep: 50,
      edge_sep: 20,
      rank_dir: RankDir.LR
    }
  });

  let vertexRefs = new Map<string, any>();
  let nodeHeights = new Map<string, number>();

  allTables.forEach(table => {
    let indexCount = showIndexes ? table.indexes.length : 0;
    let height = estimateNodeHeight({
      columnCount: table.columns.length,
      indexCount: indexCount
    });
    nodeHeights.set(table.tableFullId, height);

    let vertexRef = graph.new_vertex(
      {
        layout: {
          shape_w: NODE_WIDTH,
          shape_h: height
        },
        render: {
          id: table.tableFullId
        }
      },
      { compute_bounding_box: false }
    );
    vertexRefs.set(table.tableFullId, vertexRef);
  });

  // Add edges to vizdom graph for layout
  edgeInfos.forEach(edgeInfo => {
    let sourceRef = vertexRefs.get(edgeInfo.sourceKey);
    let targetRef = vertexRefs.get(edgeInfo.targetKey);
    if (sourceRef && targetRef) {
      graph.new_edge(sourceRef, targetRef);
    }
  });

  let positioned = graph.layout();
  let jsonResult = positioned.to_json().to_obj();

  // Build position map from vizdom output
  let positionMap = new Map<string, { x: number; y: number }>();

  jsonResult.nodes.forEach(vertex => {
    let vertexId = vertex.id;
    if (vertexId) {
      positionMap.set(vertexId, {
        x: vertex.x - vertex.width / 2,
        y: vertex.y - vertex.height / 2
      });
    }
  });

  // Build ngx-vflow nodes
  let nodeDataSignals = new Map<string, WritableSignal<MapNodeData>>();
  let nodes: Node[] = [];

  allTables.forEach(table => {
    let pos = positionMap.get(table.tableFullId) || { x: 0, y: 0 };
    let height = nodeHeights.get(table.tableFullId);

    let nodeData: MapNodeData = {
      connectionId: table.connectionId,
      schemaName: table.schemaName,
      tableName: table.tableName,
      columns: table.columns,
      indexes: showIndexes ? table.indexes : [],
      color: 'gray',
      selectedColumnName: undefined,
      onSelect: () =>
        onSelect({
          tableFullId: table.tableFullId,
          connectionId: table.connectionId,
          schemaName: table.schemaName,
          tableName: table.tableName
        }),
      onHover: () => onHover({ tableFullId: table.tableFullId }),
      onUnhover: () => onUnhover({ tableFullId: table.tableFullId }),
      onTableSampleToggle: () =>
        onTableSampleToggle({
          tableFullId: table.tableFullId,
          connectionId: table.connectionId,
          schemaName: table.schemaName,
          tableName: table.tableName
        }),
      onColumnSampleToggle: (colItem: { columnName: string }) =>
        onColumnSampleToggle({
          tableFullId: table.tableFullId,
          connectionId: table.connectionId,
          schemaName: table.schemaName,
          tableName: table.tableName,
          columnName: colItem.columnName
        })
    };

    let dataSignal = signal(nodeData);
    nodeDataSignals.set(table.tableFullId, dataSignal);

    nodes.push({
      id: table.tableFullId,
      type: 'html-template',
      point: signal({ x: pos.x, y: pos.y }),
      width: signal(NODE_WIDTH),
      height: signal(height),
      data: dataSignal
    });
  });

  // Build ngx-vflow edges
  let edgeDataSignals = new Map<string, WritableSignal<MapEdgeData>>();
  let edgesByTable = new Map<string, Set<string>>();
  let edges: Edge[] = [];
  let edgeIndex = 0;

  edgeInfos.forEach(edgeInfo => {
    let sourcePos = positionMap.get(edgeInfo.sourceKey) || { x: 0, y: 0 };
    let targetPos = positionMap.get(edgeInfo.targetKey) || { x: 0, y: 0 };

    let isLeft = sourcePos.x > targetPos.x;
    let isReversed = isLeft;

    let labelParts: string[] = [];
    labelParts.push(`${edgeInfo.sourceColumn} → ${edgeInfo.targetColumn}`);
    if (edgeInfo.relationshipType) {
      labelParts.push(edgeInfo.relationshipType);
    }
    if (edgeInfo.isForeignKey) {
      labelParts.push('FK');
    }

    let markers = edgeInfo.relationshipType
      ? getEdgeMarkers({
          relationshipType: edgeInfo.relationshipType,
          isReversed: isReversed
        })
      : {
          markerStartId: undefined,
          markerEndId: undefined,
          className: ''
        };

    let sourceSide = isLeft ? 'left' : 'right';
    let targetSide = isLeft ? 'right' : 'left';

    let edgeId = `e-${edgeIndex++}`;

    let edgeData: MapEdgeData = {
      label: labelParts.join(' '),
      markerStartId: markers.markerStartId,
      markerEndId: markers.markerEndId,
      className: markers.className,
      highlighted: false
    };

    let edgeDataSignal = signal(edgeData);
    edgeDataSignals.set(edgeId, edgeDataSignal);

    // Track which tables this edge touches
    let sourceEdges = edgesByTable.get(edgeInfo.sourceKey);
    if (!sourceEdges) {
      sourceEdges = new Set<string>();
      edgesByTable.set(edgeInfo.sourceKey, sourceEdges);
    }
    sourceEdges.add(edgeId);

    let targetEdges = edgesByTable.get(edgeInfo.targetKey);
    if (!targetEdges) {
      targetEdges = new Set<string>();
      edgesByTable.set(edgeInfo.targetKey, targetEdges);
    }
    targetEdges.add(edgeId);

    edges.push({
      id: edgeId,
      type: 'template',
      source: edgeInfo.sourceKey,
      target: edgeInfo.targetKey,
      sourceHandle: `${edgeInfo.sourceColumn}-${sourceSide}-source`,
      targetHandle: `${edgeInfo.targetColumn}-${targetSide}-target`,
      curve: signal('smooth-step' as const),
      data: edgeDataSignal,
      edgeLabels: signal({})
    });
  });

  return {
    nodes: nodes,
    edges: edges,
    nodeDataSignals: nodeDataSignals,
    edgeDataSignals: edgeDataSignals,
    edgesByTable: edgesByTable
  };
}
