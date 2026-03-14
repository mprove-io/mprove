import { signal, WritableSignal } from '@angular/core';
import initVizdom, { DirectedGraph, RankDir } from '@vizdom/vizdom-ts-web';
import { Edge, Node } from 'ngx-vflow';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import {
  ConnectionSchemaItem,
  SchemaColumn,
  SchemaTable
} from '#common/interfaces/backend/connection-schema';

let NODE_WIDTH = 250;
let HEADER_HEIGHT = 40;
let ROW_HEIGHT = 26;
let NODE_PADDING = 16;

export interface MapNodeData {
  tableName: string;
  columns: SchemaColumn[];
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

function estimateNodeHeight(item: { columnCount: number }): number {
  let { columnCount } = item;
  return HEADER_HEIGHT + columnCount * ROW_HEIGHT + NODE_PADDING;
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
  connectionSchemaItems: ConnectionSchemaItem[];
  connectionId: string;
  schemaName: string;
  onSelect: (item: { tableName: string }) => void;
  onHover: (item: { tableName: string }) => void;
  onUnhover: (item: { tableName: string }) => void;
  onTableSampleToggle: (item: { tableName: string }) => void;
  onColumnSampleToggle: (item: {
    tableName: string;
    columnName: string;
  }) => void;
}): Promise<MapGraphResult> {
  let {
    connectionSchemaItems,
    connectionId,
    schemaName,
    onSelect,
    onHover,
    onUnhover,
    onTableSampleToggle,
    onColumnSampleToggle
  } = item;

  // 1. Find matching ConnectionSchemaItem
  let csItem = connectionSchemaItems.find(
    cs => cs.connectionId === connectionId
  );
  if (!csItem) {
    return {
      nodes: [],
      edges: [],
      nodeDataSignals: new Map(),
      edgeDataSignals: new Map(),
      edgesByTable: new Map()
    };
  }

  // 2. Find all tables in the same schema
  let allTables = csItem.schema.tables.filter(t => t.schemaName === schemaName);

  if (allTables.length === 0) {
    return {
      nodes: [],
      edges: [],
      nodeDataSignals: new Map(),
      edgeDataSignals: new Map(),
      edgesByTable: new Map()
    };
  }

  // 3. Build table lookup
  let tableMap = new Map<string, SchemaTable>();
  for (let table of allTables) {
    tableMap.set(table.tableName, table);
  }

  // 4. Collect all edges (relationships) between tables
  interface EdgeInfo {
    sourceTable: string;
    targetTable: string;
    sourceColumn: string;
    targetColumn: string;
    relationshipType: RelationshipTypeEnum;
    isForeignKey: boolean;
  }

  let edgeInfos: EdgeInfo[] = [];
  let connectedPairs = new Set<string>();

  for (let table of allTables) {
    for (let col of table.columns) {
      if (col.combinedReferences) {
        for (let ref of col.combinedReferences) {
          let hasTarget = tableMap.has(ref.referencedTableName);
          if (!hasTarget) {
            continue;
          }
          let isSelfRef = ref.referencedTableName === table.tableName;
          if (isSelfRef) {
            continue;
          }

          let pairKey = `${table.tableName}:${col.columnName}->${ref.referencedTableName}:${ref.referencedColumnName}`;
          let alreadyAdded = connectedPairs.has(pairKey);
          if (alreadyAdded) {
            continue;
          }
          connectedPairs.add(pairKey);

          edgeInfos.push({
            sourceTable: table.tableName,
            targetTable: ref.referencedTableName,
            sourceColumn: col.columnName,
            targetColumn: ref.referencedColumnName,
            relationshipType: ref.relationshipType,
            isForeignKey: ref.isForeignKey
          });
        }
      }
    }
  }

  // 5. Compute layout with vizdom
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

  for (let table of allTables) {
    let height = estimateNodeHeight({
      columnCount: table.columns.length
    });
    nodeHeights.set(table.tableName, height);

    let vertexRef = graph.new_vertex(
      {
        layout: {
          shape_w: NODE_WIDTH,
          shape_h: height
        },
        render: {
          id: table.tableName
        }
      },
      { compute_bounding_box: false }
    );
    vertexRefs.set(table.tableName, vertexRef);
  }

  // Add edges to vizdom graph for layout
  for (let edgeInfo of edgeInfos) {
    let sourceRef = vertexRefs.get(edgeInfo.sourceTable);
    let targetRef = vertexRefs.get(edgeInfo.targetTable);
    if (sourceRef && targetRef) {
      graph.new_edge(sourceRef, targetRef);
    }
  }

  let positioned = graph.layout();
  let jsonResult = positioned.to_json().to_obj();

  // 6. Build position map from vizdom output
  let positionMap = new Map<string, { x: number; y: number }>();

  for (let vertex of jsonResult.nodes) {
    let tableName = vertex.id;
    if (tableName) {
      positionMap.set(tableName, {
        x: vertex.x - vertex.width / 2,
        y: vertex.y - vertex.height / 2
      });
    }
  }

  // 7. Build ngx-vflow nodes
  let nodeDataSignals = new Map<string, WritableSignal<MapNodeData>>();
  let nodes: Node[] = [];

  for (let table of allTables) {
    let pos = positionMap.get(table.tableName) || { x: 0, y: 0 };
    let height = nodeHeights.get(table.tableName);

    let nodeData: MapNodeData = {
      tableName: table.tableName,
      columns: table.columns,
      color: 'gray',
      selectedColumnName: undefined,
      onSelect: () => onSelect({ tableName: table.tableName }),
      onHover: () => onHover({ tableName: table.tableName }),
      onUnhover: () => onUnhover({ tableName: table.tableName }),
      onTableSampleToggle: () =>
        onTableSampleToggle({ tableName: table.tableName }),
      onColumnSampleToggle: (colItem: { columnName: string }) =>
        onColumnSampleToggle({
          tableName: table.tableName,
          columnName: colItem.columnName
        })
    };

    let dataSignal = signal(nodeData);
    nodeDataSignals.set(table.tableName, dataSignal);

    nodes.push({
      id: table.tableName,
      type: 'html-template',
      point: signal({ x: pos.x, y: pos.y }),
      width: signal(NODE_WIDTH),
      height: signal(height),
      data: dataSignal
    });
  }

  // 8. Build ngx-vflow edges
  let edgeDataSignals = new Map<string, WritableSignal<MapEdgeData>>();
  let edgesByTable = new Map<string, Set<string>>();
  let edges: Edge[] = [];
  let edgeIndex = 0;

  for (let edgeInfo of edgeInfos) {
    let sourcePos = positionMap.get(edgeInfo.sourceTable) || { x: 0, y: 0 };
    let targetPos = positionMap.get(edgeInfo.targetTable) || { x: 0, y: 0 };

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
    let sourceEdges = edgesByTable.get(edgeInfo.sourceTable);
    if (!sourceEdges) {
      sourceEdges = new Set<string>();
      edgesByTable.set(edgeInfo.sourceTable, sourceEdges);
    }
    sourceEdges.add(edgeId);

    let targetEdges = edgesByTable.get(edgeInfo.targetTable);
    if (!targetEdges) {
      targetEdges = new Set<string>();
      edgesByTable.set(edgeInfo.targetTable, targetEdges);
    }
    targetEdges.add(edgeId);

    edges.push({
      id: edgeId,
      type: 'template',
      source: edgeInfo.sourceTable,
      target: edgeInfo.targetTable,
      sourceHandle: `${edgeInfo.sourceColumn}-${sourceSide}-source`,
      targetHandle: `${edgeInfo.targetColumn}-${targetSide}-target`,
      curve: signal('smooth-step' as const),
      data: edgeDataSignal,
      edgeLabels: signal({})
    });
  }

  return {
    nodes: nodes,
    edges: edges,
    nodeDataSignals: nodeDataSignals,
    edgeDataSignals: edgeDataSignals,
    edgesByTable: edgesByTable
  };
}
