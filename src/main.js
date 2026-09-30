/**
 * Forma — Computation & Automata Studio
 * Master Application Controller
 */

import './style.css';
import { normalizeRegex } from './core/regex.js';
import { buildNFA } from './core/nfa.js';
import { determinize } from './core/dfa.js';
import { minimizeDFA } from './core/minimizer.js';
import { simulateDFA } from './core/simulator.js';
import { getFormalDefinition, generateLatex, generateMermaid } from './core/formal.js';
import { AutomataGraph } from './ui/graph.js';
import { SimulationStepper } from './ui/stepper.js';
import { BatchTester } from './ui/batch.js';

// DOM Selectors Helper
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Application State
const state = {
  rawRegex: '(a|b)*abb',
  currentView: 'dfa', // 'nfa' | 'dfa' | 'min_dfa'
  activeBottomTab: 'simulator', // 'simulator' | 'batch' | 'formal' | 'table'
  includeTrap: false,
  nfa: null,
  dfa: null,
  minDfa: null,
  currentAutomaton: null,
  simInput: 'aabb'
};

// Examples Catalog
const EXAMPLES = [
  {
    category: 'Textbook Classics',
    name: 'Ends with "abb"',
    regex: '(a|b)*abb',
    desc: 'Matches any string over {a, b} that terminates in abb.',
    test: 'aabb'
  },
  {
    category: 'Textbook Classics',
    name: 'Contains "ab"',
    regex: '(a|b)*ab(a|b)*',
    desc: 'Matches strings containing the substring ab anywhere.',
    test: 'aababb'
  },
  {
    category: 'Repetition & Quantifiers',
    name: 'One or more a’s (a+)',
    regex: 'a+',
    desc: 'Matches {a, aa, aaa, ...} using Kleene plus.',
    test: 'aaa'
  },
  {
    category: 'Repetition & Quantifiers',
    name: 'Optional b after a (ab?)',
    regex: 'a(b)?',
    desc: 'Matches either "a" or "ab" using optional quantifier.',
    test: 'ab'
  },
  {
    category: 'Binary Languages',
    name: 'Even number of 0’s',
    regex: '1*(01*01*)*',
    desc: 'Binary strings with an even count of zero symbols.',
    test: '10101'
  },
  {
    category: 'Binary Languages',
    name: 'Binary Divisible by 3',
    regex: '(0|1(01*0)*1)*',
    desc: 'Standard binary automaton for numbers divisible by 3.',
    test: '110'
  },
  {
    category: 'Compilers & Lexing',
    name: 'Identifier Name',
    regex: '(a|b|c)(a|b|c|0|1)*',
    desc: 'Starts with a letter followed by alphanumeric symbols.',
    test: 'a0b1'
  },
  {
    category: 'Compilers & Lexing',
    name: 'Floating-Point Number',
    regex: '(0|1)+.(0|1)+',
    desc: 'Simplified binary floating point decimal representation.',
    test: '10.01'
  }
];

// Initialize Subsystems
let graphVisualizer = null;
let stepperController = null;
let batchTester = null;

function init() {
  // Initialize Graph
  graphVisualizer = new AutomataGraph('#graphWrap', {
    onNodeClick: (nodeId) => {
      console.log('Node clicked:', nodeId);
    }
  });

  // Initialize Stepper
  stepperController = new SimulationStepper({
    onStepChange: ({ currentState, visited, activeTransition }) => {
      graphVisualizer.setSimulationState(currentState, visited, activeTransition);
    }
  });

  // Initialize Batch Tester
  batchTester = new BatchTester('#batchResultsTable', {
    onLoadString: (str) => {
      $('#testInput').value = str;
      switchBottomTab('simulator');
      runSimulation();
    }
  });

  bindUIEvents();
  renderExamplesModal();
  generateAll();
}

function bindUIEvents() {
  // Generate on Button & Enter
  $('#generateBtn').addEventListener('click', generateAll);
  $('#regexInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') generateAll();
  });

  $('#clearBtn').addEventListener('click', () => {
    $('#regexInput').value = '';
    $('#regexInput').focus();
  });

  // Automata View Switcher (NFA / DFA / MinDFA)
  $$('.automata-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      switchAutomataView(view);
    });
  });

  // Bottom Subsystem Tabs (Simulator / Batch / Formal / Table)
  $$('.tab-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      switchBottomTab(tab);
    });
  });

  // Trap state toggle
  const trapToggle = $('#trapToggle');
  if (trapToggle) {
    trapToggle.addEventListener('change', (e) => {
      state.includeTrap = e.target.checked;
      generateAll();
    });
  }

  // Simulation Trigger
  $('#runBtn').addEventListener('click', runSimulation);
  $('#testInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') runSimulation();
  });

  // Graph Controls
  $('#zoomIn').addEventListener('click', () => graphVisualizer.zoomIn());
  $('#zoomOut').addEventListener('click', () => graphVisualizer.zoomOut());
  $('#resetView').addEventListener('click', () => graphVisualizer.resetZoom());
  $('#exportSvgBtn').addEventListener('click', () => graphVisualizer.exportSVG());
  $('#exportPngBtn').addEventListener('click', () => graphVisualizer.exportPNG());

  // Copy LaTeX / Mermaid
  $('#copyLatexBtn').addEventListener('click', () => {
    const latex = generateLatex(state.currentAutomaton);
    navigator.clipboard.writeText(latex).then(() => showToast('LaTeX code copied!'));
  });

  $('#copyMermaidBtn').addEventListener('click', () => {
    const mm = generateMermaid(state.currentAutomaton);
    navigator.clipboard.writeText(mm).then(() => showToast('Mermaid diagram copied!'));
  });

  // Examples Modal
  const modal = $('#modal');
  $('#examplesNav').addEventListener('click', () => modal.hidden = false);
  $('#closeModal').addEventListener('click', () => modal.hidden = true);
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.hidden = true;
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generateAll();
    } else if (e.key === 'Escape') {
      modal.hidden = true;
    }
  });
}

function generateAll() {
  const errorEl = $('#error');
  errorEl.hidden = true;

  try {
    const input = $('#regexInput').value;
    const normalized = normalizeRegex(input);
    if (!normalized) {
      throw new Error('Please enter a regular expression to construct automata.');
    }

    state.rawRegex = normalized;

    // 1. Build Thompson NFA
    state.nfa = buildNFA(normalized);

    // 2. Build Subset Construction DFA
    state.dfa = determinize(state.nfa, state.includeTrap);

    // 3. Build Hopcroft Minimized DFA
    state.minDfa = minimizeDFA(state.dfa);

    // Update View
    updateCurrentAutomaton();
    renderFormalMath();
    renderDerivationTable();
    batchTester.setAutomaton(state.currentAutomaton);
    runSimulation();

  } catch (err) {
    errorEl.textContent = `Error: ${err.message}`;
    errorEl.hidden = false;
  }
}

function switchAutomataView(view) {
  state.currentView = view;
  $$('.automata-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  updateCurrentAutomaton();
  runSimulation();
}

function updateCurrentAutomaton() {
  if (state.currentView === 'nfa') {
    state.currentAutomaton = state.nfa;
  } else if (state.currentView === 'min_dfa') {
    state.currentAutomaton = state.minDfa;
  } else {
    state.currentAutomaton = state.dfa;
  }

  // Update Status Pill and State Counts
  const typeBadge = $('#automataTypeBadge');
  const countBadge = $('#stateCount');
  const reductionBadge = $('#reductionBadge');

  if (state.currentAutomaton) {
    graphVisualizer.setAutomaton(state.currentAutomaton);
    if (typeBadge) typeBadge.textContent = state.currentAutomaton.type;
    if (countBadge) countBadge.textContent = state.currentAutomaton.states.length;

    if (reductionBadge) {
      if (state.currentView === 'min_dfa' && state.minDfa) {
        reductionBadge.textContent = `Optimized: ${state.minDfa.reductionRatio}`;
        reductionBadge.hidden = false;
      } else {
        reductionBadge.hidden = true;
      }
    }
  }
}

function switchBottomTab(tabName) {
  state.activeBottomTab = tabName;
  $$('.tab-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  $$('.bottom-tab-pane').forEach(pane => {
    pane.hidden = pane.id !== `tab-${tabName}`;
  });

  if (tabName === 'batch') {
    batchTester.setAutomaton(state.currentAutomaton);
  }
}

function runSimulation() {
  if (!state.currentAutomaton) return;

  const testStr = $('#testInput').value;
  state.simInput = testStr;

  // Run simulation on DFA or MinDFA (or subset DFA if currently on NFA)
  const autoToSim = state.currentView === 'nfa' ? state.dfa : state.currentAutomaton;
  const simResult = simulateDFA(autoToSim, testStr);

  stepperController.loadSimulation(simResult, testStr);
}

function renderFormalMath() {
  const formalBox = $('#formalMathBox');
  if (!formalBox || !state.currentAutomaton) return;

  const def = getFormalDefinition(state.currentAutomaton);
  if (!def) return;

  formalBox.innerHTML = `
    <div class="formal-card">
      <div class="formal-header">
        <span class="formal-title">Mathematical 5-Tuple Definition: M = (Q, Σ, δ, q₀, F)</span>
        <span class="formal-badge">${state.currentAutomaton.type}</span>
      </div>
      <div class="formal-grid">
        <div class="formal-row">
          <span class="formal-symbol">Q</span>
          <span class="formal-desc">Set of all States:</span>
          <code class="formal-code">${def.states}</code>
          <span class="formal-count">|Q| = ${def.statesCount}</span>
        </div>
        <div class="formal-row">
          <span class="formal-symbol">Σ</span>
          <span class="formal-desc">Input Alphabet:</span>
          <code class="formal-code">${def.alphabet}</code>
          <span class="formal-count">|Σ| = ${def.alphabetCount}</span>
        </div>
        <div class="formal-row">
          <span class="formal-symbol">q₀</span>
          <span class="formal-desc">Initial / Start State:</span>
          <code class="formal-code">${def.startState}</code>
        </div>
        <div class="formal-row">
          <span class="formal-symbol">F</span>
          <span class="formal-desc">Set of Final / Accept States:</span>
          <code class="formal-code">${def.acceptStates}</code>
          <span class="formal-count">|F| = ${def.acceptCount}</span>
        </div>
        <div class="formal-row">
          <span class="formal-symbol">δ</span>
          <span class="formal-desc">Transition Function:</span>
          <span class="formal-note">δ: Q × Σ → Q (See Transition Table below)</span>
        </div>
      </div>
    </div>
  `;
}

function renderDerivationTable() {
  const tableWrap = $('#tableWrap');
  if (!tableWrap || !state.currentAutomaton) return;

  const auto = state.currentAutomaton;
  const alphabet = auto.alphabet;

  let headerHtml = `<tr><th>STATE</th>`;
  alphabet.forEach(a => {
    headerHtml += `<th>${a}</th>`;
  });
  headerHtml += `<th>NFA SUBSET</th><th>TYPE</th></tr>`;

  let rowsHtml = '';
  auto.states.forEach(s => {
    const isStart = s.id === auto.start;
    const isAccept = auto.acceptStates.includes(s.id);
    const subLabel = s.set ? `{${s.set.join(',')}}` : (s.originalStates ? `{${s.originalStates.join(',')}}` : '—');

    let colsHtml = `<td>${isStart ? '<span class="start-marker">→ </span>' : ''}<b>${s.name || `q${s.id}`}</b></td>`;

    alphabet.forEach(a => {
      if (auto.type === 'NFA') {
        const nexts = s.edges.filter(e => e.symbol === a).map(e => `q${e.to}`);
        colsHtml += `<td>${nexts.length > 0 ? nexts.join(', ') : '—'}</td>`;
      } else {
        const target = s.transitions[a];
        colsHtml += `<td>${target !== null && target !== undefined ? `q${target}` : '<span class="trap-val">∅</span>'}</td>`;
      }
    });

    colsHtml += `<td><small class="subset-text">${subLabel}</small></td>`;
    colsHtml += `<td>${isAccept ? '<span class="accept-tag">ACCEPTING</span>' : '<span class="nonaccept-tag">NON-ACCEPTING</span>'}</td>`;

    rowsHtml += `<tr>${colsHtml}</tr>`;
  });

  tableWrap.innerHTML = `
    <table>
      <thead>${headerHtml}</thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
}

function renderExamplesModal() {
  const list = $('#exampleList');
  if (!list) return;

  list.innerHTML = EXAMPLES.map((ex, idx) => `
    <button class="example-item" data-index="${idx}">
      <span class="example-num">0${idx + 1}</span>
      <div class="example-info">
        <span class="example-cat">${ex.category}</span>
        <b>${ex.name}</b>
        <small>${ex.desc}</small>
      </div>
      <code class="example-regex">${ex.regex}</code>
      <span class="example-arrow">↗</span>
    </button>
  `).join('');

  list.querySelectorAll('.example-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.index, 10);
      const ex = EXAMPLES[idx];
      $('#regexInput').value = ex.regex;
      $('#testInput').value = ex.test;
      $('#modal').hidden = true;
      generateAll();
    });
  });
}

function showToast(msg) {
  let toast = $('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// Start application
window.addEventListener('DOMContentLoaded', init);
