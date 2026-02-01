export class CycleGraph {
  private edges = new Map<string, string[]>();

  add(node: string, deps: string[]) {
    let existing = this.edges.get(node) || [];
    this.edges.set(node, [...existing, ...deps]);
    for (let dep of deps) {
      if (!this.edges.has(dep)) this.edges.set(dep, []);
    }
  }

  hasCycle(): boolean {
    return this.findCycle() !== null;
  }

  getCycles(): Array<Array<{ name: string }>> {
    let cycle = this.findCycle();
    return cycle ? [cycle.map(name => ({ name }))] : [];
  }

  private findCycle(): string[] | null {
    let visited = new Set<string>();
    let stack = new Set<string>();

    let dfs = (node: string, path: string[]): string[] | null => {
      if (stack.has(node)) return path.slice(path.indexOf(node));
      if (visited.has(node)) return null;

      visited.add(node);
      stack.add(node);

      for (let dep of this.edges.get(node) || []) {
        let cycle = dfs(dep, [...path, node]);
        if (cycle) return cycle;
      }

      stack.delete(node);
      return null;
    };

    for (let node of this.edges.keys()) {
      let cycle = dfs(node, []);
      if (cycle) return cycle;
    }
    return null;
  }
}
