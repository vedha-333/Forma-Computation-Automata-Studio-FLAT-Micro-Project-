/**
 * Step-by-Step Simulation Stepper & Tape Controller
 */

export class SimulationStepper {
  constructor(options = {}) {
    this.simResult = null;
    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 700; // ms per step

    this.onStepChange = options.onStepChange || (() => {});
    this.tapeContainer = document.querySelector('#tapeContainer');
    this.statusBox = document.querySelector('#resultBox');
    this.traceContainer = document.querySelector('#trace');

    this.bindControls();
  }

  bindControls() {
    const playBtn = document.querySelector('#playBtn');
    const stepNextBtn = document.querySelector('#stepNextBtn');
    const stepPrevBtn = document.querySelector('#stepPrevBtn');
    const resetBtn = document.querySelector('#stepResetBtn');
    const endBtn = document.querySelector('#stepEndBtn');
    const speedSelect = document.querySelector('#simSpeed');

    if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
    if (stepNextBtn) stepNextBtn.addEventListener('click', () => this.nextStep());
    if (stepPrevBtn) stepPrevBtn.addEventListener('click', () => this.prevStep());
    if (resetBtn) resetBtn.addEventListener('click', () => this.firstStep());
    if (endBtn) endBtn.addEventListener('click', () => this.lastStep());

    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        this.speed = parseInt(e.target.value, 10);
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    }
  }

  loadSimulation(simResult, rawString = '') {
    this.pause();
    this.simResult = simResult;
    this.rawString = rawString;
    this.currentStepIdx = 0;
    this.renderTape();
    this.applyCurrentStep();
  }

  firstStep() {
    this.pause();
    this.currentStepIdx = 0;
    this.applyCurrentStep();
  }

  prevStep() {
    this.pause();
    if (this.currentStepIdx > 0) {
      this.currentStepIdx--;
      this.applyCurrentStep();
    }
  }

  nextStep() {
    if (!this.simResult || !this.simResult.steps) return;
    if (this.currentStepIdx < this.simResult.steps.length - 1) {
      this.currentStepIdx++;
      this.applyCurrentStep();
      return true;
    } else {
      this.pause();
      return false;
    }
  }

  lastStep() {
    this.pause();
    if (this.simResult && this.simResult.steps.length > 0) {
      this.currentStepIdx = this.simResult.steps.length - 1;
      this.applyCurrentStep();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.simResult) return;
    if (this.currentStepIdx >= this.simResult.steps.length - 1) {
      this.currentStepIdx = 0;
      this.applyCurrentStep();
    }

    this.isPlaying = true;
    this.updatePlayButton();

    this.timer = setInterval(() => {
      const hasMore = this.nextStep();
      if (!hasMore) {
        this.pause();
      }
    }, this.speed);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.updatePlayButton();
  }

  updatePlayButton() {
    const playBtn = document.querySelector('#playBtn');
    if (playBtn) {
      playBtn.innerHTML = this.isPlaying
        ? '<span>⏸</span> Pause'
        : '<span>▶</span> Play';
      playBtn.classList.toggle('btn-playing', this.isPlaying);
    }
  }

  renderTape() {
    if (!this.tapeContainer) return;

    if (!this.rawString) {
      this.tapeContainer.innerHTML = `
        <div class="tape-cell tape-empty active-head">
          <span class="tape-char">ε</span>
          <span class="tape-index">0</span>
        </div>
      `;
      return;
    }

    const cells = [];
    for (let i = 0; i < this.rawString.length; i++) {
      const char = this.rawString[i];
      cells.push(`
        <div class="tape-cell" data-index="${i}">
          <span class="tape-char">${char}</span>
          <span class="tape-index">${i}</span>
        </div>
      `);
    }

    // End marker cell ⊣
    cells.push(`
      <div class="tape-cell tape-end" data-index="${this.rawString.length}">
        <span class="tape-char">⊣</span>
        <span class="tape-index">${this.rawString.length}</span>
      </div>
    `);

    this.tapeContainer.innerHTML = cells.join('');
  }

  applyCurrentStep() {
    if (!this.simResult || !this.simResult.steps || this.simResult.steps.length === 0) return;

    const step = this.simResult.steps[this.currentStepIdx];
    const prevStep = this.currentStepIdx > 0 ? this.simResult.steps[this.currentStepIdx - 1] : null;

    // Update Tape Head pointer
    if (this.tapeContainer) {
      const allCells = this.tapeContainer.querySelectorAll('.tape-cell');
      allCells.forEach((cell, idx) => {
        cell.classList.remove('active-head', 'processed-char');
        if (idx === step.tapeIndex) {
          cell.classList.add('active-head');
        } else if (idx < step.tapeIndex) {
          cell.classList.add('processed-char');
        }
      });
    }

    // Step indicators
    const stepCountEl = document.querySelector('#stepCountLabel');
    if (stepCountEl) {
      stepCountEl.textContent = `Step ${this.currentStepIdx} / ${this.simResult.steps.length - 1}`;
    }

    // Active path for graph
    const visited = this.simResult.steps
      .slice(0, this.currentStepIdx + 1)
      .map(s => s.currentState)
      .filter(s => s !== null);

    const activeTransition = prevStep && step.symbol ? {
      from: prevStep.currentState,
      to: step.currentState,
      symbol: step.symbol
    } : null;

    // Update Result Box Status
    const isFinalStep = this.currentStepIdx === this.simResult.steps.length - 1;
    if (this.statusBox) {
      if (!isFinalStep) {
        this.statusBox.className = 'result-box running';
        const titleEl = document.querySelector('#resultTitle');
        const detailEl = document.querySelector('#resultDetail');
        if (titleEl) titleEl.textContent = `At state q${step.currentState}`;
        if (detailEl) {
          detailEl.textContent = step.symbol
            ? `Read symbol '${step.symbol}' → Transitioned to q${step.currentState}`
            : `Initial state q${step.currentState}`;
        }
      } else {
        this.statusBox.className = `result-box ${this.simResult.accepted ? 'accepted' : 'rejected'}`;
        const titleEl = document.querySelector('#resultTitle');
        const detailEl = document.querySelector('#resultDetail');
        if (titleEl) titleEl.textContent = this.simResult.accepted ? 'String Accepted ✓' : 'String Rejected ✗';
        if (detailEl) detailEl.textContent = this.simResult.reason;
      }
    }

    // Render Trace
    if (this.traceContainer) {
      const traceItems = [];
      for (let i = 0; i <= this.currentStepIdx; i++) {
        const s = this.simResult.steps[i];
        const isCurrent = i === this.currentStepIdx;
        const isFinal = isFinalStep && isCurrent;

        if (i === 0) {
          traceItems.push(`<span class="trace-state ${isCurrent ? 'trace-current' : ''}">q${s.currentState}</span>`);
        } else {
          traceItems.push(`
            <span class="trace-arrow"><small>${s.symbol}</small>→</span>
            <span class="trace-state ${isFinal ? (this.simResult.accepted ? 'trace-accepted' : 'trace-rejected') : (isCurrent ? 'trace-current' : '')}">
              ${s.currentState !== null ? `q${s.currentState}` : '∅'}
            </span>
          `);
        }
      }
      this.traceContainer.innerHTML = traceItems.join('');
    }

    // Trigger graph update callback
    this.onStepChange({
      currentState: step.currentState,
      visited,
      activeTransition
    });
  }
}
