// Copied from malloy/packages/malloy-db-databricks/src/databricks_connection.ts
// DatabricksTypeParser (lines 35-120)
// Parses Databricks type strings: struct<name:type>, array<type>, map<k,v>, decimal(p,s)

import type {
  AtomicTypeDef,
  FieldDef,
  RecordTypeDef
} from '@malloydata/malloy';
import { DatabricksDialect, mkFieldDef } from '@malloydata/malloy';
import { TinyParser } from '@malloydata/malloy/internal';

export class DatabricksTypeParser extends TinyParser {
  constructor(
    typeStr: string,
    private readonly dialect: DatabricksDialect
  ) {
    super(typeStr, {
      space: /^\s+/,
      char: /^[<>:,()]/,
      id: /^\w+/
    });
  }

  typeDef(): AtomicTypeDef {
    const typToken = this.read();
    if (typToken.type === 'eof') {
      throw this.parseError('Unexpected EOF parsing type');
    }
    const typText = typToken.text.toLowerCase();

    if (typText === 'struct' && this.match('<')) {
      const fields: FieldDef[] = [];
      for (;;) {
        const name = this.expect('id');
        this.expect(':');
        const fieldType = this.typeDef();
        fields.push(mkFieldDef(fieldType, name.text));
        if (this.match('>')) break;
        this.expect(',');
      }
      return { type: 'record', fields: fields } as RecordTypeDef;
    }

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

    if (typText === 'map' && this.match('<')) {
      this.typeDef(); // key type
      this.expect(',');
      this.typeDef(); // value type
      this.expect('>');
      return { type: 'sql native' };
    }

    // Atomic type — parse parameters for DECIMAL, skip for others
    if (typToken.type === 'id') {
      if (typText === 'decimal' && this.match('(')) {
        this.expect('id'); // precision
        let numberType: 'integer' | 'float' = 'integer';
        if (this.match(',')) {
          const scale = this.expect('id');
          if (scale.text !== '0') numberType = 'float';
        }
        this.expect(')');
        return { type: 'number', numberType: numberType };
      }
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
