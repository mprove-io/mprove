# Composer Instructions

`AGENTS.md` is generated from the Markdown source files in `.composer/content/`.
Do not edit `AGENTS.md` directly.

When asked to add or change a rule or section in `AGENTS.md`:

- Edit or create the corresponding Markdown source file in `.composer/content/`.
- Use `.composer/content/<section-slug>.md` for a top-level section and
  `.composer/content/<section-slug>/<rule-slug>.md` for a rule nested under that
  section.
- Every directory inside `.composer/content/` must have a sibling Markdown file
  with the same name. For example, `.composer/content/rules/` requires
  `.composer/content/rules.md`.
- Source filename stems may contain only lowercase letters (`a-z`), digits
  (`0-9`), and hyphens (`-`).
- Start every source file with an H1 whose slug matches the filename
  case-insensitively. Hyphens in the filename may be replaced with spaces in the
  H1.
- List every Markdown source file exactly once in `.composer/COMPOSER.md` as a
  Markdown list with one path per list item. The manifest order controls output
  order, and directory depth controls heading depth.
- Run `pnpm composer .composer/COMPOSER.md .composer/content AGENTS.md` to
  regenerate `AGENTS.md`.
