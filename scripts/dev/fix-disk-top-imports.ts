import { type Dirent, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Run manually after moving the disk functions: pnpm exec tsx scripts/dev/fix-disk-top-imports.ts
function fixDiskTopImports(item: { root: string }): void {
  let { root } = item;

  let names: string[] = [
    'handle-http-request',
    'log-to-console-disk',
    'make-invalid-request-response',
    'prepare-test',
    'process-validated-request'
  ];

  let moves: Map<string, string> = new Map(
    names.map(name => [
      resolve(root, `apps/disk/src/functions/${name}`),
      resolve(root, `apps/disk/src/functions/top/${name}/${name}`)
    ])
  );

  let sourceRoot: string = resolve(root, 'apps/disk/src');

  let directories: string[] = [sourceRoot];

  let files: string[] = [];

  for (let i = 0; i < directories.length; i++) {
    let directory: string = directories[i];

    let entries: Dirent[] = readdirSync(directory, { withFileTypes: true });

    entries.forEach(entry => {
      let path: string = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        directories.push(path);
      } else if (
        entry.isFile() &&
        /\.(?:[cm]?[jt]s|[jt]sx)$/.test(entry.name)
      ) {
        files.push(relative(root, path));
      }
    });
  }

  let changed = 0;

  files.forEach(file => {
    let path: string = resolve(root, file);

    let text: string = readFileSync(path, 'utf8');

    let source: ts.SourceFile = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true
    );

    let nodes: ts.Node[] = [source];

    let edits: { start: number; end: number; text: string }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      let node: ts.Node = nodes[i];

      node.forEachChild(child => {
        nodes.push(child);
      });

      if (!ts.isStringLiteral(node)) {
        continue;
      }

      let parent: ts.Node = node.parent;

      if (
        !(
          ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) &&
            parent.moduleSpecifier === node) ||
          (ts.isCallExpression(parent) &&
            parent.arguments[0] === node &&
            (parent.expression.kind === ts.SyntaxKind.ImportKeyword ||
              (ts.isIdentifier(parent.expression) &&
                parent.expression.text === 'require'))) ||
          (ts.isLiteralTypeNode(parent) &&
            ts.isImportTypeNode(parent.parent)) ||
          ts.isExternalModuleReference(parent)
        )
      ) {
        continue;
      }

      let specifier: string = node.text;

      let replacement: string = specifier;

      names.forEach(name => {
        let oldAlias = `#disk/functions/${name}`;

        if (
          specifier === oldAlias ||
          specifier === `${oldAlias}.ts` ||
          specifier === `${oldAlias}.js`
        ) {
          replacement = specifier.replace(
            oldAlias,
            `#disk/functions/top/${name}/${name}`
          );
        }
      });

      if (specifier.startsWith('.')) {
        let extension: string = specifier.match(/\.(?:ts|js)$/)?.[0] ?? '';

        let target: string = resolve(
          dirname(path),
          extension ? specifier.slice(0, -extension.length) : specifier
        );

        let destination: string = moves.get(target);

        if (destination) {
          let relativePath: string = relative(dirname(path), destination);

          replacement = `${relativePath.startsWith('.') ? '' : './'}${relativePath}${extension}`;
        }
      }

      if (replacement !== specifier) {
        edits.push({
          start: node.getStart(source) + 1,
          end: node.getEnd() - 1,
          text: replacement
        });
      }
    }

    if (edits.length === 0) {
      return;
    }

    edits.sort((a, b) => b.start - a.start);

    edits.forEach(edit => {
      text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
    });

    writeFileSync(path, text);

    changed++;

    console.log(file);
  });

  console.log(`Updated ${changed} file(s).`);
}

let scriptPath: string = fileURLToPath(import.meta.url);

let root: string = resolve(dirname(scriptPath), '../..');

fixDiskTopImports({ root: root });
