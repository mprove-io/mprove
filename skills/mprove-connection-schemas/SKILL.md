---
name: mprove-connection-schemas
description: Get, create or update schema metadata for mprove project connections
---

# Get, create or update schema metadata for mprove project connections

## Mprove Schema Files

Schema files provide metadata (descriptions, examples, relationships) for database tables and columns.
They are combined with raw database schemas to build "combined schemas" that are useful for creating Malloy semantic models.

## When to Use

- Before creating Malloy models, to ensure combined schemas have proper metadata
- User asks to create or update schema metadata for a connection
- User asks to describe tables, columns, or relationships for a connection

## File Location and Naming

- Directory: `schemas/` inside the `mprove_dir` directory (e.g., `data/schemas/`)
- Naming: `<connection_name>.<schema_name>.schema`
- Example: `c1_postgres.fleet.schema`

## File Format

```yaml
schema: <connection_name>.<schema_name>
description: 'Human-readable description of this database schema'
tables:
  - table: <table_name>
    description: 'What this table contains and its business purpose'
    columns:
      - column: <column_name>
        description: 'What this column represents'
        example: 'A realistic sample value'
        relationships:
          - to: <target_table>.<target_column>
            type: <relationship_type>
```

## Allowed Parameters

Using unknown parameters at any level causes a validation error.

**Schema level:** `schema` (required), `description`, `tables` (required)

**Table level:** `table` (required), `description`, `columns`

**Column level:** `column` (required), `description`, `example`, `relationships`

**Relationship level:** `to` (required), `type` (required), `to_schema` (optional, for cross-schema)

## Relationship Rules

**Types:** `many_to_one`, `one_to_many`, `one_to_one`, `many_to_many`

**`to` format:** Must be `table_name.column_name` (exactly one dot, word characters only).

**Cross-schema:** For relationships to tables in a different schema on the same connection, add `to_schema: <connection_name>.<other_schema_name>`. The connection name must match the file's `schema` connection name.

**No duplicates:** A column cannot have two relationships with the same `to` (and `to_schema`) value.

**Mirror consistency:** If table A column X relates to table B column Y, and table B column Y also relates back to table A column X, the types must be consistent mirrors:

- `one_to_many` mirrors `many_to_one` (and vice versa)
- `one_to_one` mirrors `one_to_one`
- `many_to_many` mirrors `many_to_many`

You do not need to define both sides. Prefer `many_to_one` over `one_to_many` — define on the "many" side pointing to the "one" side. If you define both sides, ensure the types are consistent.

## Partial Coverage

You must include all tables that have relationships to other tables. For columns, only include those where you want to add descriptions, examples, or relationships. Omitted columns simply get no metadata enrichment.

## Workflow

### Step 1: Read Session Parameters

Read `/home/user/.config/opencode/mprove-session.json` to get `projectId`, `repoId`, `branchId`, and `envId`.

### Step 2: Fetch Combined Schemas

Call the `get-schemas` MCP tool:

| Parameter              | Value        |
| ---------------------- | ------------ |
| projectId              | from session |
| envId                  | from session |
| repoId                 | from session |
| branchId               | from session |
| isRefreshExistingCache | false        |

Set `isRefreshExistingCache` to `true` only if you need to refresh cached schemas from the database.

Response structure:

- `combinedSchemaItems` — array, each item has:
  - `connectionId` — connection name (e.g., `c1_postgres`)
  - `schemas` — array of `{ schemaName, description?, tables[] }`
    - Each table: `{ tableName, tableType, columns[], indexes[], description? }`
    - Each column: `{ columnName, dataType, isNullable, isPrimaryKey?, isUnique?, foreignKeys[], description?, example?, references[] }`
    - Each reference: `{ relationshipType?, isForeignKey, referencedSchemaName?, referencedTableName, referencedColumnName }`

Existing `description`, `example`, and `references` values come from previously written schema files.
Use `foreignKeys` and `references` arrays to infer relationships without running queries.

### Step 3: Check Existing Schema Files

Look for existing `.schema` files in `data/schemas/`. If files exist, read them to understand what metadata has already been defined.

### Step 4: Sample Data

For tables of interest, call the `get-sample` MCP tool:

| Parameter    | Value                               |
| ------------ | ----------------------------------- |
| projectId    | from session                        |
| envId        | from session                        |
| connectionId | e.g., `c1_postgres`                 |
| schemaName   | e.g., `fleet`                       |
| tableName    | e.g., `trips`                       |
| columnName   | optional — omit to get all columns  |
| offset       | optional — skip rows for pagination |

Response: `{ columnNames: string[], rows: string[][], errorMessage? }`

Use sample data to write meaningful descriptions and realistic examples.

### Step 5: Determine Relationship Types

If `foreignKeys`, `references`, and sample data from previous steps are not enough to determine cardinality,
you can create a custom malloy source with mprove model tag:

```malloy
#(mprove) model
source: check is c1_postgres.table('fleet.trips') extend {
  measure:
    total_rows is count()
    distinct_vehicle_ids is count(distinct vehicle_id)
}
```

Then create an mprove chart file and run it using mcp tool to get data (total_rows and distinct_vehicle_ids)

If `total_rows` equals `distinct_vehicle_ids`, the relationship is `one_to_one`.
If `total_rows` is greater, it is `many_to_one` from `trips` to `vehicles`.

### Step 6: Write Schema Files

Create or update `.schema` files in `data/schemas/`. Guidelines:

- Write clear, business-oriented descriptions (not just restating the column name)
- Use realistic but non-sensitive values for `example` fields (do not copy actual data from get-sample — use it only to understand the format and range)
- Only include columns that have relationships or where descriptions/examples add value
- Verify relationship types are accurate before writing

## Complete Example

```yaml
schema: c1_postgres.fleet
description: 'Fleet management system tracking vehicles, drivers, trips, and maintenance records'
tables:
  - table: trips
    description: 'Individual vehicle trips with route, distance, and assigned driver'
    columns:
      - column: trip_id
        description: 'Unique identifier for each trip'
        example: '80234'
      - column: vehicle_id
        description: 'The vehicle used for this trip'
        example: '152'
        relationships:
          - to: vehicles.vehicle_id
            type: many_to_one
      - column: driver_id
        description: 'The driver who operated the vehicle on this trip'
        example: '38'
        relationships:
          - to: drivers.driver_id
            type: many_to_one
      - column: status
        description: 'Trip completion status'
        example: 'completed'

  - table: vehicles
    description: 'Fleet vehicles with make, model, and current operational status'
    columns:
      - column: vehicle_id
        description: 'Unique identifier for each vehicle'
        example: '152'
      - column: license_plate
        description: 'Vehicle registration plate number'
        example: 'AB-1234-CD'

  - table: drivers
    description: 'Drivers certified to operate fleet vehicles'
    columns:
      - column: driver_id
        description: 'Unique identifier for each driver'
        example: '38'
      - column: name
        description: 'Full name of the driver'
        example: 'Carlos Rivera'

  - table: maintenance_records
    description: 'Scheduled and unscheduled vehicle maintenance events'
    columns:
      - column: record_id
        description: 'Unique identifier for each maintenance record'
        example: '6010'
      - column: vehicle_id
        description: 'The vehicle that was serviced'
        example: '152'
        relationships:
          - to: vehicles.vehicle_id
            type: many_to_one
      - column: service_type
        description: 'Type of maintenance performed'
        example: 'oil change'
```
