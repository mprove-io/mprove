// Based on malloy/packages/malloy-db-databricks/src/databricks_connection.ts
// DatabricksTypeParser — adapted for BigQuery syntax
// BigQuery uses STRUCT<name TYPE, ...> (space separator) vs Databricks struct<name:type>
// BigQuery also uses RECORD as alias for STRUCT
// Parses: STRUCT<name TYPE>, ARRAY<TYPE>, nested combinations

import type {
  AtomicTypeDef,
  FieldDef,
  RecordTypeDef
} from '@malloydata/malloy';
import { mkFieldDef, StandardSQLDialect } from '@malloydata/malloy';
import { TinyParser } from '@malloydata/malloy/internal';

export class BigQueryTypeParser extends TinyParser {
  constructor(
    typeStr: string,
    private readonly dialect: StandardSQLDialect
  ) {
    super(typeStr, {
      space: /^\s+/,
      char: /^[<>,()]/,
      id: /^\w+/
    });
  }

  typeDef(): AtomicTypeDef {
    const typToken = this.read();
    if (typToken.type === 'eof') {
      throw this.parseError('Unexpected EOF parsing type');
    }
    const typText = typToken.text.toLowerCase();

    // STRUCT<name TYPE, ...> or RECORD<name TYPE, ...>
    if ((typText === 'struct' || typText === 'record') && this.match('<')) {
      const fields: FieldDef[] = [];
      for (;;) {
        const name = this.expect('id');
        // BigQuery uses space between name and type (no colon)
        const fieldType = this.typeDef();
        fields.push(mkFieldDef(fieldType, name.text));
        if (this.match('>')) break;
        this.expect(',');
      }
      return { type: 'record', fields: fields } as RecordTypeDef;
    }

    // ARRAY<TYPE>
    if (typText === 'array' && this.match('<')) {
      const elType = this.typeDef();
      this.expect('>');
      return elType.type === 'record'
        ? {
            type: 'array',
            elementTypeDef: { type: 'record_element' },
            fields: elType.fields
          }
        : { type: 'array', elementTypeDef: elType };
    }

    // Atomic type — skip parameters like NUMERIC(10,2)
    if (typToken.type === 'id') {
      if (this.match('(')) {
        let depth = 1;
        while (depth > 0) {
          const t = this.read();
          if (t.text === '(') depth++;
          else if (t.text === ')') depth--;
        }
      }
      return this.dialect.sqlTypeToMalloyType(typText);
    }

    throw this.parseError(`Unexpected '${typToken.text}' while parsing type`);
  }
}
