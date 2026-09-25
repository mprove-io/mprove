export class CycleGraph {
  private edges = new Map<string, string[]>();

  add(node: string, deps: string[]) {
    let existing = this.edges.get(node) || [];
    this.edges.set(node, [...existing, ...deps]);
    deps.forEach(dep => {
      if (!this.edges.has(dep)) this.edges.set(dep, []);
    });
  }

  hasCycle(): boolean {
    return this.findCycle() !== null;
  }

  getCycles(): Array<Array<{ name: string }>> {
    let cycle = this.findCycle();
    return cycle ? [cycle.map(name => ({ name }))] : [];
  }

  private findCycle(): string[] {
    let visited = new Set<string>();
    let stack = new Set<string>();

    let dfs = (node: string, path: string[]): string[] => {
      if (stack.has(node)) return path.slice(path.indexOf(node));
      if (visited.has(node)) return null;

      visited.add(node);
      stack.add(node);

      let deps = this.edges.get(node) || [];

      let foundCycle: string[] = null;

      deps.forEach(dep => {
        if (foundCycle) return;

        let cycle = dfs(dep, [...path, node]);

        if (cycle) foundCycle = cycle;
      });

      if (foundCycle) return foundCycle;

      stack.delete(node);
      return null;
    };

    let nodes = [...this.edges.keys()];

    let result: string[] = null;

    nodes.forEach(node => {
      if (result) return;

      let cycle = dfs(node, []);

      if (cycle) result = cycle;
    });
    return result;
  }
}
