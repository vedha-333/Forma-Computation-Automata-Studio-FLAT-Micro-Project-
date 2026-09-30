/**
 * DFA Minimization (Hopcroft's Partition Refinement Algorithm)
 */

export function minimizeDFA(dfa) {
  const alphabet = dfa.alphabet;

  // Step 1: Eliminate unreachable states from start state
  const reachable = new Set();
  const queue = [dfa.start];
  reachable.add(dfa.start);

  while (queue.length > 0) {
    const currId = queue.shift();
    const state = dfa.states.find(s => s.id === currId);
    if (!state) continue;

    for (const a of alphabet) {
      const nextId = state.transitions[a];
      if (nextId !== null && nextId !== undefined && !reachable.has(nextId)) {
        reachable.add(nextId);
        queue.push(nextId);
      }
    }
  }

  const activeStates = dfa.states.filter(s => reachable.has(s.id));
  const acceptSet = new Set(dfa.acceptStates.filter(id => reachable.has(id)));
  const nonAcceptSet = new Set(activeStates.map(s => s.id).filter(id => !acceptSet.has(id)));

  // Step 2: Initial partition into Accepting (F) and Non-Accepting (Q \ F)
  let partitions = [];
  if (nonAcceptSet.size > 0) partitions.push(Array.from(nonAcceptSet));
  if (acceptSet.size > 0) partitions.push(Array.from(acceptSet));

  // Find group index of a given state
  const getGroupIndex = (stateId, currentPartitions) => {
    if (stateId === null || stateId === undefined) return -1;
    for (let g = 0; g < currentPartitions.length; g++) {
      if (currentPartitions[g].includes(stateId)) return g;
    }
    return -1;
  };

  // Step 3: Iterative Partition Refinement
  let changed = true;
  while (changed) {
    changed = false;
    const newPartitions = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        newPartitions.push(group);
        continue;
      }

      // Group states by signature: [targetGroup for each symbol]
      const signatureMap = new Map();

      for (const stateId of group) {
        const state = activeStates.find(s => s.id === stateId);
        const sig = alphabet
          .map(a => getGroupIndex(state ? state.transitions[a] : null, partitions))
          .join('|');

        if (!signatureMap.has(sig)) {
          signatureMap.set(sig, []);
        }
        signatureMap.get(sig).push(stateId);
      }

      const subgroups = Array.from(signatureMap.values());
      if (subgroups.length > 1) {
        changed = true;
      }
      newPartitions.push(...subgroups);
    }

    partitions = newPartitions;
  }

  // Step 4: Build Minimized DFA from final partitions
  // Sort partitions so that the one with original start state comes first (id 0)
  partitions.sort((a, b) => {
    const aHasStart = a.includes(dfa.start);
    const bHasStart = b.includes(dfa.start);
    if (aHasStart) return -1;
    if (bHasStart) return 1;
    return a[0] - b[0];
  });

  const minStates = [];
  const minAcceptStates = [];

  for (let i = 0; i < partitions.length; i++) {
    const group = partitions[i];
    const repId = group[0];
    const repState = activeStates.find(s => s.id === repId);

    const isStart = group.includes(dfa.start);
    const isAccept = group.some(id => acceptSet.has(id));

    if (isAccept) minAcceptStates.push(i);

    const transitions = {};
    for (const a of alphabet) {
      const targetOriginal = repState ? repState.transitions[a] : null;
      const targetGroupIndex = getGroupIndex(targetOriginal, partitions);
      transitions[a] = targetGroupIndex >= 0 ? targetGroupIndex : null;
    }

    // Merge NFA subset info for transparency
    const mergedNfaSet = Array.from(
      new Set(group.flatMap(id => {
        const orig = dfa.states.find(s => s.id === id);
        return orig && orig.set ? orig.set : [];
      }))
    ).sort((a, b) => a - b);

    minStates.push({
      id: i,
      name: `q${i}`,
      originalStates: group.map(id => `q${id}`),
      set: mergedNfaSet,
      isStart,
      isAccept,
      transitions
    });
  }

  return {
    type: 'MIN_DFA',
    states: minStates,
    alphabet,
    start: 0,
    acceptStates: minAcceptStates,
    reductionRatio: `${dfa.states.length} → ${minStates.length} states`
  };
}
