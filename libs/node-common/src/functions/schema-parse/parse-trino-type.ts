// Copied from malloy/packages/malloy-db-trino/src/trino_connection.ts
// TrinoPrestoSchemaParser (lines 590-731)
// Parses Trino/Presto type strings: row(name type, ...), array(type), map(k,v),
// timestamp with time zone, decimal(p,s)

import type {
  AtomicTypeDef,
  Dialect,
  FieldDef,
  RecordTypeDef
} from '@malloydata/malloy';
import { mkFieldDef, TinyParser } from '@malloydata/malloy';

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
    this.next('['); // Expect start of name list
    const fieldNames: string[] = [];
    for (;;) {
      const nmToken = this.next('id');
      fieldNames.push(nmToken.text);
      const sep = this.next();
      if (sep.type === ',') {
        continue;
      }
      if (sep.type !== ']') {
        throw this.parseError(
          `Unexpected '${sep.text}' while getting field name list`
        );
      }
      break;
    }
    return fieldNames;
  }

  parseQueryPlan(): FieldDef[] {
    const fieldNames = this.fieldNameList();
    const fields: FieldDef[] = [];
    this.next('arrow', '[');
    for (let nameIndex = 0; ; nameIndex += 1) {
      const name = fieldNames[nameIndex];
      this.next('id', ':');
      const nextType = this.typeDef();
      fields.push(mkFieldDef(nextType, name));
      const sep = this.next();
      if (sep.text === ',') {
        continue;
      }
      if (sep.text !== ']') {
        throw this.parseError(`Unexpected '${sep.text}' between field types`);
      }
      break;
    }
    if (fields.length !== fieldNames.length) {
      throw new Error(
        `Presto schema error mismatched ${fields.length} types and ${fieldNames.length} fields`
      );
    }
    return fields;
  }

  typeDef(): AtomicTypeDef {
    const typToken = this.next();
    if (typToken.type === 'eof') {
      throw this.parseError(
        'Unexpected EOF parsing type, expected a type name'
      );
    } else if (typToken.text === 'row' && this.next('(')) {
      const fields: FieldDef[] = [];
      for (;;) {
        const name = this.next();
        if (name.type !== 'id' && name.type !== 'quoted_name') {
          throw this.parseError(`Expected property name, got '${name.type}'`);
        }
        const getDef = this.typeDef();
        fields.push(mkFieldDef(getDef, name.text));
        const sep = this.next();
        if (sep.text === ')') {
          break;
        }
        if (sep.text === ',') {
          continue;
        }
      }
      const def: RecordTypeDef = {
        type: 'record',
        fields: fields
      };
      return def;
    } else if (typToken.text === 'array' && this.next('(')) {
      const elType = this.typeDef();
      this.next(')');
      return elType.type === 'record'
        ? {
            type: 'array',
            elementTypeDef: { type: 'record_element' },
            fields: elType.fields
          }
        : { type: 'array', elementTypeDef: elType };
    } else if (typToken.text === 'map' && this.next('(')) {
      const _keyType = this.typeDef();
      this.next(',');
      const _valType = this.typeDef();
      this.next(')');
      return { type: 'sql native' };
    } else if (typToken.type === 'id') {
      const sqlType = typToken.text.toLowerCase();
      if (sqlType === 'varchar') {
        if (this.peek().type === '(') {
          this.next('(', 'id', ')');
        }
      } else if (sqlType === 'timestamp') {
        if (this.peek().text === '(') {
          this.next('(', 'id', ')');
        }
        if (this.peek().text === 'with') {
          this.nextText('with', 'time', 'zone');
          return { type: 'timestamptz' };
        }
        return { type: 'timestamp' };
      }
      const typeDef = this.dialect.sqlTypeToMalloyType(sqlType);
      if (typeDef.type === 'number' && sqlType === 'decimal') {
        this.next('(', 'id');
        if (this.peek().type === ',') {
          this.next(',', 'id');
          typeDef.numberType = 'float';
        } else {
          typeDef.numberType = 'integer';
        }
        this.next(')');
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
