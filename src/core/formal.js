/**
 * Mathematical 5-Tuple & Formal Specification Generator
 * M = (Q, Σ, δ, q0, F)
 */

export function getFormalDefinition(automaton) {
  if (!automaton || !automaton.states) return null;

  const Q = automaton.states.map(s => s.name || `q${s.id}`);
  const Sigma = automaton.alphabet;
  const q0 = `q${automaton.start}`;
  const F = automaton.acceptStates.map(id => `q${id}`);

  return {
    states: `{ ${Q.join(', ')} }`,
    alphabet: `{ ${Sigma.join(', ')} }`,
    startState: q0,
    acceptStates: F.length > 0 ? `{ ${F.join(', ')} }` : '∅ (none)',
    statesCount: Q.length,
    alphabetCount: Sigma.length,
    acceptCount: F.length
  };
}

/**
 * Generates LaTeX representation of the transition table and 5-tuple
 */
export function generateLatex(automaton) {
  if (!automaton) return '';

  const def = getFormalDefinition(automaton);
  const alphaCols = automaton.alphabet.map(a => ` & \\text{${a}}`).join('');

  let tableRows = '';
  for (const s of automaton.states) {
    const isStart = s.id === automaton.start ? '\\to ' : '';
    const isAccept = automaton.acceptStates.includes(s.id) ? '*' : '';
    const stateLabel = `${isStart}${isAccept}q_{${s.id}}`;

    const transRow = automaton.alphabet.map(a => {
      const target = s.transitions ? s.transitions[a] : null;
      return target !== null && target !== undefined ? ` & q_{${target}}` : ' & \\emptyset';
    }).join('');

    tableRows += `  ${stateLabel}${transRow} \\\\\n`;
  }

  return `\\begin{aligned}
M &= (Q, \\Sigma, \\delta, q_0, F) \\\\
Q &= \\{ ${automaton.states.map(s => `q_{${s.id}}`).join(', ')} \\} \\\\
\\Sigma &= \\{ ${automaton.alphabet.join(', ')} \\} \\\\
q_0 &= q_{${automaton.start}} \\\\
F &= \\{ ${automaton.acceptStates.map(id => `q_{${id}}`).join(', ')} \\}
\\end{aligned}

\\begin{table}[h]
\\centering
\\begin{tabular}{c|${automaton.alphabet.map(() => 'c').join('')}}
\\hline
\\text{State}${alphaCols} \\\\
\\hline
${tableRows}\\hline
\\end{tabular}
\\caption{Transition table for automaton}
\\end{table}`;
}

/**
 * Generates Mermaid diagram syntax
 */
export function generateMermaid(automaton) {
  if (!automaton) return '';
  let mm = 'stateDiagram-v2\n';
  mm += `    [*] --> q${automaton.start}\n`;

  for (const s of automaton.states) {
    if (automaton.acceptStates.includes(s.id)) {
      mm += `    q${s.id} --> [*]\n`;
    }
  }

  // Combine edges
  const edgeMap = new Map();
  if (automaton.type === 'NFA') {
    for (const s of automaton.states) {
      for (const e of s.edges) {
        const key = `${s.id}->${e.to}`;
        if (!edgeMap.has(key)) edgeMap.set(key, []);
        edgeMap.get(key).push(e.symbol);
      }
    }
  } else {
    for (const s of automaton.states) {
      for (const a of automaton.alphabet) {
        const to = s.transitions[a];
        if (to !== null && to !== undefined) {
          const key = `${s.id}->${to}`;
          if (!edgeMap.has(key)) edgeMap.set(key, []);
          edgeMap.get(key).push(a);
        }
      }
    }
  }

  for (const [key, symbols] of edgeMap.entries()) {
    const [from, to] = key.split('->');
    mm += `    q${from} --> q${to} : ${symbols.join(', ')}\n`;
  }

  return mm;
}
