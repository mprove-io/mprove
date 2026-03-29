// Copied from malloy/packages/malloy-db-databricks/src/databricks_connection.ts
// DatabricksTypeParser (lines 35-120)
// Parses Databricks type strings: struct<name:type>, array<type>, map<k,v>, decimal(p,s)

import type {
  AtomicTypeDef,
  FieldDef,
  RecordTypeDef
} from '@malloydata/malloy';
import { DatabricksDialect, mkFieldDef, TinyParser } from '@malloydata/malloy';

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
    const typToken = this.next();
    if (typToken.type === 'eof') {
      throw this.parseError('Unexpected EOF parsing type');
    }
    const typText = typToken.text.toLowerCase();

    if (typText === 'struct' && this.peek().text === '<') {
      this.next('<');
      const fields: FieldDef[] = [];
      for (;;) {
        const name = this.next('id');
        this.next(':');
        const fieldType = this.typeDef();
        fields.push(mkFieldDef(fieldType, name.text));
        const sep = this.next();
        if (sep.text === '>') break;
        if (sep.text === ',') continue;
        throw this.parseError(`Expected '>' or ',', got '${sep.text}'`);
      }
      return { type: 'record', fields: fields } as RecordTypeDef;
    }

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

    if (typText === 'map' && this.peek().text === '<') {
      this.next('<');
      this.typeDef(); // key type
      this.next(',');
      this.typeDef(); // value type
      this.next('>');
      return { type: 'sql native' };
    }

    // Atomic type — parse parameters for DECIMAL, skip for others
    if (typToken.type === 'id') {
      if (typText === 'decimal' && this.peek().text === '(') {
        this.next('(');
        this.next('id'); // precision
        let numberType: 'integer' | 'float' = 'integer';
        if (this.peek().text === ',') {
          this.next(',');
          const scale = this.next('id');
          if (scale.text !== '0') numberType = 'float';
        }
        this.next(')');
        return { type: 'number', numberType: numberType };
      }
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
