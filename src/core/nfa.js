/**
 * Thompson's Construction Algorithm (Regular Expression -> ε-NFA)
 */

import { EPSILON, tokenize, toPostfix } from './regex.js';

export function buildNFA(expression) {
  const tokens = tokenize(expression);
  const postfix = toPostfix(tokens);

  const states = [];

  const createState = () => {
    const id = states.length;
    states.push({ id, edges: [] });
    return id;
  };

  const addEdge = (from, symbol, to) => {
    states[from].edges.push({ symbol, to });
  };

  const stack = [];

  for (let i = 0; i < postfix.length; i++) {
    const token = postfix[i];

    if (/^[a-zA-Z0-9ε]$/.test(token)) {
      const start = createState();
      const accept = createState();
      addEdge(start, token, accept);
      stack.push({ start, accept });
    } else if (token === '·') {
      const right = stack.pop();
      const left = stack.pop();
      if (!left || !right) throw new Error('Invalid concatenation operation.');

      // Connect left accept to right start via ε
      addEdge(left.accept, EPSILON, right.start);
      stack.push({ start: left.start, accept: right.accept });
    } else if (token === '|') {
      const right = stack.pop();
      const left = stack.pop();
      if (!left || !right) throw new Error('Invalid union operation.');

      const start = createState();
      const accept = createState();

      addEdge(start, EPSILON, left.start);
      addEdge(start, EPSILON, right.start);
      addEdge(left.accept, EPSILON, accept);
      addEdge(right.accept, EPSILON, accept);

      stack.push({ start, accept });
    } else if (token === '*') {
      const target = stack.pop();
      if (!target) throw new Error('Invalid Kleene star operation.');

      const start = createState();
      const accept = createState();

      addEdge(start, EPSILON, target.start);
      addEdge(start, EPSILON, accept);
      addEdge(target.accept, EPSILON, target.start);
      addEdge(target.accept, EPSILON, accept);

      stack.push({ start, accept });
    } else if (token === '+') {
      const target = stack.pop();
      if (!target) throw new Error('Invalid Kleene plus operation.');

      const start = createState();
      const accept = createState();

      addEdge(start, EPSILON, target.start);
      addEdge(target.accept, EPSILON, target.start);
      addEdge(target.accept, EPSILON, accept);

      stack.push({ start, accept });
    } else if (token === '?') {
      const target = stack.pop();
      if (!target) throw new Error('Invalid optional operation.');

      const start = createState();
      const accept = createState();

      addEdge(start, EPSILON, target.start);
      addEdge(start, EPSILON, accept);
      addEdge(target.accept, EPSILON, accept);

      stack.push({ start, accept });
    }
  }

  if (stack.length !== 1) {
    throw new Error('Incomplete regular expression. Please check operators and parentheses.');
  }

  const result = stack[0];

  // Extract alphabet (excluding epsilon)
  const alphabetSet = new Set();
  for (const s of states) {
    for (const e of s.edges) {
      if (e.symbol !== EPSILON) {
        alphabetSet.add(e.symbol);
      }
    }
  }

  const alphabet = Array.from(alphabetSet).sort();

  return {
    type: 'NFA',
    states,
    start: result.start,
    accept: result.accept,
    acceptStates: [result.accept],
    alphabet: alphabet.length > 0 ? alphabet : ['a']
  };
}
