/**
 * Automata Simulation Engine (Step-by-step and Batch Execution)
 */

export function simulateDFA(automaton, inputString = '') {
  if (!automaton || !automaton.states || automaton.states.length === 0) {
    return {
      accepted: false,
      finalState: null,
      reason: 'No automaton loaded.',
      steps: []
    };
  }

  const str = inputString.trim();
  let currentState = automaton.start;
  const steps = [];

  // Initial step at state q0
  steps.push({
    stepIndex: 0,
    currentState,
    symbol: null,
    nextState: currentState,
    tapeIndex: 0,
    isAccepting: automaton.acceptStates.includes(currentState)
  });

  let failedSymbol = null;
  let failReason = '';

  for (let i = 0; i < str.length; i++) {
    const symbol = str[i];
    const stateObj = automaton.states.find(s => s.id === currentState);

    if (!stateObj) {
      failReason = `State q${currentState} not found.`;
      break;
    }

    if (!automaton.alphabet.includes(symbol)) {
      failedSymbol = symbol;
      failReason = `Symbol '${symbol}' is not in the alphabet Σ = {${automaton.alphabet.join(', ')}}.`;
      break;
    }

    const nextState = stateObj.transitions[symbol];

    if (nextState === null || nextState === undefined) {
      failReason = `No valid transition from state q${currentState} on symbol '${symbol}'.`;
      currentState = null;
      steps.push({
        stepIndex: i + 1,
        currentState: null,
        symbol,
        nextState: null,
        tapeIndex: i + 1,
        isAccepting: false
      });
      break;
    }

    currentState = nextState;
    steps.push({
      stepIndex: i + 1,
      currentState,
      symbol,
      nextState,
      tapeIndex: i + 1,
      isAccepting: automaton.acceptStates.includes(currentState)
    });
  }

  const isAccepted = currentState !== null && automaton.acceptStates.includes(currentState) && !failReason;

  let summary = '';
  if (isAccepted) {
    summary = `String accepted. Execution halted in accepting state q${currentState}.`;
  } else if (failReason) {
    summary = `String rejected: ${failReason}`;
  } else {
    summary = `String rejected. Execution ended in non-accepting state q${currentState}.`;
  }

  return {
    accepted: isAccepted,
    finalState: currentState,
    reason: summary,
    steps,
    totalSteps: steps.length - 1,
    failedSymbol
  };
}

/**
 * Runs batch simulation over a suite of test inputs.
 */
export function batchRun(automaton, testInputs = []) {
  return testInputs.map(input => {
    const res = simulateDFA(automaton, input);
    return {
      input: input === '' ? 'ε (empty)' : input,
      rawInput: input,
      accepted: res.accepted,
      finalState: res.finalState !== null ? `q${res.finalState}` : 'Trap / ∅',
      stepsCount: res.totalSteps,
      reason: res.reason
    };
  });
}
