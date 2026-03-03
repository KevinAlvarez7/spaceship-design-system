import type { SemanticColorGroup, ColorToken } from '@/tokens/colors';

export type SemanticGrandchild = {
  label: string;
  tokens: ColorToken[];
};

export type SemanticChild = {
  label: string;
  tokens: ColorToken[];
  children: SemanticGrandchild[];
};

export type SemanticTreeNode = {
  parent: string;
  tokens: ColorToken[];
  children: SemanticChild[];
};

export function buildSemanticTree(groups: SemanticColorGroup[]): SemanticTreeNode[] {
  const nodeMap = new Map<string, SemanticTreeNode>();
  const order: string[] = [];

  function getOrCreateNode(key: string): SemanticTreeNode {
    if (!nodeMap.has(key)) {
      nodeMap.set(key, { parent: key, tokens: [], children: [] });
      order.push(key);
    }
    return nodeMap.get(key)!;
  }

  function getOrCreateChild(node: SemanticTreeNode, childLabel: string): SemanticChild {
    let child = node.children.find(c => c.label === childLabel);
    if (!child) {
      child = { label: childLabel, tokens: [], children: [] };
      node.children.push(child);
    }
    return child;
  }

  for (const group of groups) {
    const parts = group.group.split(' / ');

    if (parts.length === 1) {
      getOrCreateNode(parts[0]).tokens.push(...group.tokens);
    } else if (parts.length === 2) {
      const node = getOrCreateNode(parts[0]);
      getOrCreateChild(node, parts[1]).tokens.push(...group.tokens);
    } else {
      // 3+ parts: parts[0] = parent, parts[1] = child, parts[2..] = grandchild label
      const node = getOrCreateNode(parts[0]);
      const child = getOrCreateChild(node, parts[1]);
      const grandchildLabel = parts.slice(2).join(' / ');
      child.children.push({ label: grandchildLabel, tokens: group.tokens });
    }
  }

  return order.map(key => nodeMap.get(key)!);
}
