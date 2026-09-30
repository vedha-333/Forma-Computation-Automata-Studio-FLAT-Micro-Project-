/**
 * Batch Test Suite Component
 */

import { batchRun } from '../core/simulator.js';

export class BatchTester {
  constructor(containerId, options = {}) {
    this.container = document.querySelector(containerId);
    this.automaton = null;
    this.onLoadString = options.onLoadString || (() => {});
    this.bindEvents();
  }

  setAutomaton(automaton) {
    this.automaton = automaton;
    this.run();
  }

  bindEvents() {
    const runBtn = document.querySelector('#runBatchBtn');
    const addInput = document.querySelector('#addBatchInput');
    const addBtn = document.querySelector('#addBatchBtn');
    const textarea = document.querySelector('#batchTextarea');

    if (runBtn) {
      runBtn.addEventListener('click', () => this.run());
    }

    if (addBtn && addInput && textarea) {
      addBtn.addEventListener('click', () => {
        const val = addInput.value.trim();
        if (val) {
          textarea.value = (textarea.value ? textarea.value + '\n' : '') + val;
          addInput.value = '';
          this.run();
        }
      });
    }

    if (textarea) {
      textarea.addEventListener('input', () => this.run());
    }
  }

  run() {
    if (!this.automaton || !this.container) return;

    const textarea = document.querySelector('#batchTextarea');
    const rawText = textarea ? textarea.value : '';
    const strings = rawText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '' || rawText.includes('\n\n'));

    // Default sample test strings if empty
    const testList = strings.length > 0 ? strings : ['abb', 'aabb', 'babb', 'ababb', 'aa', 'b', ''];

    const results = batchRun(this.automaton, testList);

    const total = results.length;
    const acceptedCount = results.filter(r => r.accepted).length;
    const rejectedCount = total - acceptedCount;

    const statsEl = document.querySelector('#batchStats');
    if (statsEl) {
      statsEl.innerHTML = `
        <span class="batch-badge accepted-badge">✓ ${acceptedCount} Passed</span>
        <span class="batch-badge rejected-badge">✗ ${rejectedCount} Rejected</span>
        <span class="batch-badge total-badge">${total} Total</span>
      `;
    }

    const tableEl = document.querySelector('#batchResultsTable');
    if (tableEl) {
      tableEl.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Test Input</th>
              <th>Result</th>
              <th>Final State</th>
              <th>Steps</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${results.map((r, i) => `
              <tr class="${r.accepted ? 'row-accepted' : 'row-rejected'}">
                <td>${i + 1}</td>
                <td><code>${r.input}</code></td>
                <td><span class="status-pill ${r.accepted ? 'pill-accepted' : 'pill-rejected'}">${r.accepted ? 'ACCEPTED' : 'REJECTED'}</span></td>
                <td>${r.finalState}</td>
                <td>${r.stepsCount}</td>
                <td><button class="btn-load-trace" data-str="${r.rawInput}" title="Load into single-step simulator">Trace ↗</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      // Attach click handlers to load string into stepper
      tableEl.querySelectorAll('.btn-load-trace').forEach(btn => {
        btn.addEventListener('click', () => {
          const str = btn.dataset.str;
          this.onLoadString(str);
        });
      });
    }
  }
}
