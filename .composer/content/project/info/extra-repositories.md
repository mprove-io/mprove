# Extra repositories

The gitignored top level "extra" directory holds separate repositories.

| Repository | Location         | Used by                               |
| ---------- | ---------------- | ------------------------------------- |
| S Viewer   | `extra/s-viewer` | `check-s-viewer`                      |
| Composer   | `extra/composer` | `pnpm composer`, `pnpm test:composer` |

Set up Composer once before running `pnpm composer`:

```sh
git clone https://github.com/akalitenya/composer.git extra/composer
pnpm --dir extra/composer install
```
