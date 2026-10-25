# Forma — Computation & Automata Studio (FLAT Micro Project)

An interactive, web-based Formal Languages & Automata Theory (FLAT) learning laboratory for regular expressions, finite state automata, and step-by-step tape execution.

> 🌐 **Live demo:** [Open Forma on GitHub Pages](https://vedha-333.github.io/Forma-Computation-Automata-Studio-FLAT-Micro-Project-/)

---

## 🌟 Key Features

### 1. 🧮 Comprehensive Regular Expression Parsing
- **Supported Operators:**
  - `|` Union / Alternation
  - `·` Explicit & implicit Concatenation
  - `*` Kleene Star (0 or more)
  - `+` Kleene Plus (1 or more)
  - `?` Optional (0 or 1)
  - `( )` Arbitrary nested sub-expressions
  - `ε`, `eps`, `lambda`, `λ`, `\e` Epsilon transitions
  - Alphanumeric symbols: `[a-zA-Z0-9]`

### 2. ⚡ Multi-Stage Automata Synthesis
- **Thompson's Construction (ε-NFA):** Converts postfix regular expressions into non-deterministic finite state automata with minimal epsilon transitions.
- **Subset Construction (DFA):** Powers of state-set exploration ($\varepsilon\text{-closure}$ and $\text{move}(T, a)$) to build deterministic machines. Optional complete DFA trap state ($\emptyset$) toggle.
- **Hopcroft's DFA Minimization (Min-DFA):** Partition refinement algorithm that groups equivalent states and strips unreachable states.

### 3. 🎨 Interactive SVG Graph Visualization
- **Draggable Nodes:** Rearrange state bubbles freely in real-time.
- **Collision-Free Bezier Edge Routing:** Merges parallel transitions (e.g. `a, b`) and separates forward, backward, and self-loop arcs cleanly.
- **Visual Export:** Export generated automata directly as **SVG** or **PNG** for research reports and homework.
- **LaTeX / Mermaid:** One-click copy for LaTeX tabular / TikZ and Mermaid state diagrams.

### 4. 🧪 Simulation & Stepper Studio
- **Input Tape Visualizer:** Displays discrete tape cells with sliding head pointer ($\Downarrow$).
- **Playback Controls:** First step (⏮), Step backward (◀), Play/Pause (▶/⏸), Step forward (▶), and End (⏭) with adjustable speed (0.5x, 1x, 2x).
- **Batch Test Suite:** Input multiple test strings to view bulk evaluation tables with pass/fail badges and one-click trace loading.
- **Formal 5-Tuple Specification:** Renders mathematical definitions: $M = (Q, \Sigma, \delta, q_0, F)$.

---

## 🚀 Quick Start

### Installation
```bash
# Clone repository
git clone https://github.com/vedha-333/Forma-Computation-Automata-Studio-FLAT-Micro-Project-.git
cd Forma-Computation-Automata-Studio-FLAT-Micro-Project-

# Install dependencies
npm install

# Run local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

Each push to `main` builds and deploys the site to GitHub Pages.

---

## 📁 Project Architecture

```
Forma-Computation-Automata-Studio-FLAT-Micro-Project-/
├── .github/workflows/deploy.yml # Build and deploy workflow
├── index.html            # Main HTML layout & application shell
├── package.json          # Project configuration & scripts (Vite)
├── vite.config.js         # Relative asset paths for GitHub Pages
├── src/
│   ├── core/
│   │   ├── regex.js      # Lexer, parser & Shunting-Yard postfix converter
│   │   ├── nfa.js        # Thompson's ε-NFA construction algorithm
│   │   ├── dfa.js        # Subset construction (NFA -> DFA)
│   │   ├── minimizer.js  # Hopcroft partition refinement minimization
│   │   ├── simulator.js  # Single-step & batch execution engine
│   │   └── formal.js     # Mathematical 5-tuple, LaTeX, and Mermaid exporters
│   ├── ui/
│   │   ├── graph.js      # Interactive SVG graph visualizer (drag & zoom)
│   │   ├── stepper.js    # Step-by-step playback & input tape component
│   │   └── batch.js      # Multi-input test suite runner
│   ├── main.js           # Master application coordinator
│   └── style.css         # Dark computational aesthetic & design system
└── README.md             # Project documentation
```

---

## 🎓 Academic Algorithms Implemented

1. **Shunting-Yard Algorithm** for infix-to-postfix regex parsing with explicit concatenation insertion.
2. **Thompson's Construction** ($\varepsilon$-NFA composition).
3. **$\varepsilon$-Closure & Subset Construction** for NFA $\to$ DFA determinization.
4. **Hopcroft's Partition Refinement** for DFA state minimization ($O(k \cdot n \log n)$).
