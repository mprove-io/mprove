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
import { mkFieldDef, StandardSQLDialect, TinyParser } from '@malloydata/malloy';

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
    const typToken = this.next();
    if (typToken.type === 'eof') {
      throw this.parseError('Unexpected EOF parsing type');
    }
    const typText = typToken.text.toLowerCase();

    // STRUCT<name TYPE, ...> or RECORD<name TYPE, ...>
    if (
      (typText === 'struct' || typText === 'record') &&
      this.peek().text === '<'
    ) {
      this.next('<');
      const fields: FieldDef[] = [];
      for (;;) {
        const name = this.next('id');
        // BigQuery uses space between name and type (no colon)
        const fieldType = this.typeDef();
        fields.push(mkFieldDef(fieldType, name.text));
        const sep = this.next();
        if (sep.text === '>') break;
        if (sep.text === ',') continue;
        throw this.parseError(`Expected '>' or ',', got '${sep.text}'`);
      }
      return { type: 'record', fields: fields } as RecordTypeDef;
    }

    // ARRAY<TYPE>
    if (typText === 'array' && this.peek().text === '<') {
      this.next('<');
      const elType = this.typeDef();
      this.next('>');
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
      if (this.peek().text === '(') {
        this.next('(');
        let depth = 1;
        while (depth > 0) {
          const t = this.next();
          if (t.text === '(') depth++;
          else if (t.text === ')') depth--;
        }
      }
      return this.dialect.sqlTypeToMalloyType(typText);
    }

    throw this.parseError(`Unexpected '${typToken.text}' while parsing type`);
  }
}
