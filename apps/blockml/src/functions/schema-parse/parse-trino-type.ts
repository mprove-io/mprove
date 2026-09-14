// Copied from malloy/packages/malloy-db-trino/src/trino_connection.ts
// TrinoPrestoSchemaParser (lines 585-710)
// Parses Trino/Presto type strings: row(name type, ...), array(type), map(k,v),
// timestamp with time zone, decimal(p,s)

import type {
  AtomicTypeDef,
  Dialect,
  FieldDef,
  RecordTypeDef
} from '@malloydata/malloy';
import { mkFieldDef } from '@malloydata/malloy';
import { TinyParser } from '@malloydata/malloy/internal';

export class TrinoPrestoSchemaParser extends TinyParser {
  constructor(
    readonly input: string,
    readonly dialect: Dialect
  ) {
    super(input, {
      space: /^\s+/,
      arrow: /^=>/,
      char: /^[,:[\]()-]/,
      id: /^\w+/,
      quoted_name: /^"(\\"|[^"])*"/
    });
  }

  fieldNameList(): string[] {
    this.skipTo(']'); // Skip to end of plan
    this.expect('['); // Expect start of name list
    const fieldNames: string[] = [];
    for (;;) {
      const nmToken = this.expect('id');
      fieldNames.push(nmToken.text);
      if (!this.match(',')) {
        this.expect(']');
        break;
      }
    }
    return fieldNames;
  }

  parseQueryPlan(): FieldDef[] {
    const fieldNames = this.fieldNameList();
    const fields: FieldDef[] = [];
    this.expect('arrow', '[');
    for (let nameIndex = 0; ; nameIndex += 1) {
      const name = fieldNames[nameIndex];
      this.expect('id', ':');
      const nextType = this.typeDef();
      fields.push(mkFieldDef(nextType, name));
      if (!this.match(',')) {
        this.expect(']');
        break;
      }
    }
    if (fields.length !== fieldNames.length) {
      throw new Error(
        `Presto schema error mismatched ${fields.length} types and ${fieldNames.length} fields`
      );
    }
    return fields;
  }

  typeDef(): AtomicTypeDef {
    const typToken = this.read();
    if (typToken.type === 'eof') {
      throw this.parseError(
        'Unexpected EOF parsing type, expected a type name'
      );
    } else if (typToken.text === 'row') {
      this.expect('(');
      const fields: FieldDef[] = [];
      for (;;) {
        const name = this.match('id') ?? this.match('quoted_name');
        if (!name) {
          throw this.parseError('Expected property name');
        }
        const getDef = this.typeDef();
        fields.push(mkFieldDef(getDef, name.text));
        if (!this.match(',')) {
          this.expect(')');
          break;
        }
      }
      const def: RecordTypeDef = {
        type: 'record',
        fields: fields
      };
      return def;
    } else if (typToken.text === 'array') {
      this.expect('(');
      const elType = this.typeDef();
      this.expect(')');
      return elType.type === 'record'
        ? {
            type: 'array',
            elementTypeDef: { type: 'record_element' },
            fields: elType.fields
          }
        : { type: 'array', elementTypeDef: elType };
    } else if (typToken.text === 'map') {
      this.expect('(');
      const _keyType = this.typeDef();
      this.expect(',');
      const _valType = this.typeDef();
      this.expect(')');
      return { type: 'sql native' };
    } else if (typToken.type === 'id') {
      const sqlType = typToken.text.toLowerCase();
      if (sqlType === 'varchar') {
        if (this.match('(')) this.expect('id', ')');
      } else if (sqlType === 'timestamp') {
        if (this.match('(')) this.expect('id', ')');
        if (this.matchText('with', 'time', 'zone')) {
          return { type: 'timestamptz' };
        }
        return { type: 'timestamp' };
      }
      const typeDef = this.dialect.sqlTypeToMalloyType(sqlType);
      if (typeDef.type === 'number' && sqlType === 'decimal') {
        this.expect('(', 'id');
        if (this.match(',', 'id')) {
          typeDef.numberType = 'float';
        } else {
          typeDef.numberType = 'integer';
        }
        this.expect(')');
      }
      if (typeDef === undefined) {
        throw this.parseError(`Can't parse presto type ${sqlType}`);
      }
      return typeDef;
    }
    throw this.parseError(
      `'${typToken.text}' unexpected while looking for a type`
    );
  }
}
