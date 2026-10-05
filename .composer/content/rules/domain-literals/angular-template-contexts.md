# Angular template contexts

With `strictTemplates` enabled, keep domain literals inline in equality and
inequality comparisons when Angular checks them against a finite domain union.
Do not introduce component properties solely for already-checked comparisons.

```html
<!-- chartType is ChartType, so Angular checks the literal. -->
<div *ngIf="chartType === 'table'"></div>
```

For comparisons against `any`, broad `string`, or otherwise unchecked values,
prefer typing the underlying form control or template context with its domain
type. If that is not practical, expose a `readonly` component property with an
explicit domain type and use it in the template.

Do not assume a template value is typed merely because its source collection is
typed. Third-party `let-item` contexts and plain `ng-template` contexts may
expose `any` even with `strictTemplates` enabled.

This comparison rule does not apply to all template expressions. Legacy
`*ngSwitchCase` does not check membership against the switch expression's
domain, and concatenation does not check domain tokens. Use explicitly
domain-typed component properties for those unchecked literals. Template
collections follow the separate "Angular collections" rule; checking a
membership argument does not validate every literal in an inline array against
the domain.
