/**
 * Subset Construction (Determinization: ε-NFA -> DFA)
 */

import { EPSILON } from './regex.js';

/**
 * Computes the ε-closure of a given set of NFA states.
 */
export function epsilonClosure(nfa, stateSet) {
  const result = new Set(stateSet);
  const stack = [...stateSet];

  while (stack.length > 0) {
    const stateId = stack.pop();
    const state = nfa.states[stateId];
    if (!state) continue;

    for (const edge of state.edges) {
      if (edge.symbol === EPSILON && !result.has(edge.to)) {
        result.add(edge.to);
        stack.push(edge.to);
      }
    }
  }

  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Computes the move set: δ(stateSet, symbol)
 */
export function move(nfa, stateSet, symbol) {
  const targets = new Set();
  for (const stateId of stateSet) {
    const state = nfa.states[stateId];
    if (!state) continue;

    for (const edge of state.edges) {
      if (edge.symbol === symbol) {
        targets.add(edge.to);
      }
    }
  }
  return epsilonClosure(nfa, Array.from(targets));
}

/**
 * Converts an ε-NFA into a DFA using Subset Construction.
 */
export function determinize(nfa, includeTrapState = false) {
  const alphabet = [...nfa.alphabet];
  const initialClosure = epsilonClosure(nfa, [nfa.start]);

  const stateKey = set => set.join(',');
  const sets = [initialClosure];
  const stateMap = new Map([[stateKey(initialClosure), 0]]);
  const derivationLog = [];

  const dfaStates = [];

  for (let i = 0; i < sets.length; i++) {
    const currentSet = sets[i];
    const transitions = {};
    const derivationRow = {
      id: i,
      name: `q${i}`,
      nfaSet: currentSet,
      moves: {}
    };

    for (const symbol of alphabet) {
      const nextSet = move(nfa, currentSet, symbol);
      derivationRow.moves[symbol] = nextSet;

      if (nextSet.length === 0) {
        if (includeTrapState) {
          const emptyKey = '';
          if (!stateMap.has(emptyKey)) {
            const trapId = sets.length;
            stateMap.set(emptyKey, trapId);
            sets.push([]);
          }
          transitions[symbol] = stateMap.get(emptyKey);
        } else {
          // Trap/dead transition omitted in compact DFA view
          transitions[symbol] = null;
        }
      } else {
        const key = stateKey(nextSet);
        if (!stateMap.has(key)) {
          const nextId = sets.length;
          stateMap.set(key, nextId);
          sets.push(nextSet);
        }
        transitions[symbol] = stateMap.get(key);
      }
    }

    const isAccept = currentSet.includes(nfa.accept);
    dfaStates.push({
      id: i,
      name: `q${i}`,
      set: currentSet,
      isStart: i === 0,
      isAccept,
      transitions
    });

    derivationLog.push(derivationRow);
  }

  // Filter out null transitions if needed
  const acceptStates = dfaStates.filter(s => s.isAccept).map(s => s.id);

  return {
    type: 'DFA',
    states: dfaStates,
    alphabet,
    start: 0,
    acceptStates,
    derivationLog
  };
}
