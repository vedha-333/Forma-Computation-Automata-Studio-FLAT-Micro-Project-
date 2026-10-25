<div align="center">

# ⚡ FORMA · AUTOMATA STUDIO
### Formal Languages & Automata Theory (FLAT) Interactive Laboratory

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20App-00C896?style=for-the-badge&logo=googlechrome&logoColor=white)](https://vedha-333.github.io/Forma-Computation-Automata-Studio-FLAT-Micro-Project-/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vedha-333/Forma-Computation-Automata-Studio-FLAT-Micro-Project-)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

**Transform regular expressions into live, interactive state transition graphs with discrete tape simulation, instant determinization, and Hopcroft minimization.**

[🚀 Launch Live Application](https://vedha-333.github.io/Forma-Computation-Automata-Studio-FLAT-Micro-Project-/) • [📖 Quick Start](#-quick-start) • [🧠 Academic Algorithms](#-academic-algorithms) • [📊 Core Capabilities](#-core-capabilities)

</div>

---

## 🎯 Overview

**Forma** is an interactive, browser-based computer science laboratory engineered for students, educators, and researchers exploring **Formal Languages and Automata Theory (FLAT)**.

Instead of drawing static graphs on paper, Forma lets you type any arbitrary regular expression, dynamically compiles it through the complete formal pipeline ($\text{Regex} \to \varepsilon\text{-NFA} \to \text{DFA} \to \text{Min-DFA}$), lays out smooth Bézier graphs in real-time, and steps through arbitrary input tapes one symbol at a time.

```
   ┌────────────┐      Shunting-Yard       ┌──────────────────┐
   │ Regular    │ ───────────────────────► │ Postfix Notation │
   │ Expression │                          └─────────┬────────┘
   └────────────┘                                    │
                                           Thompson's Construction
                                                     │
                                                     ▼
   ┌──────────────────────────────────────────────────────────┐
   │            ε-NFA (Non-Deterministic Automata)            │
   └────────────────────────┬─────────────────────────────────┘
                            │
                   Subset Construction
                 (ε-Closure & Move sets)
                            │
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │                DFA (Deterministic Automata)              │
   └────────────────────────┬─────────────────────────────────┘
                            │
              Hopcroft Partition Refinement
               (Strip unreachable + Merge)
                            │
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │           Minimized DFA & Discrete Tape Stepper          │
   └──────────────────────────────────────────────────────────┘
```

---

## ✨ Core Capabilities

<table>
<tr>
<td width="50%" valign="top">

### 🧮 1. Advanced Regex Engine
- **Infix to Postfix Converter:** Implements Dijkstra's Shunting-Yard algorithm with automatic implicit concatenation insertion (`ab` $\to$ `a·b`).
- **Rich Operator Grammar:**
  - `|` Alternation / Union
  - `·` Explicit / Implicit Concatenation
  - `*` Kleene Star (0 or more)
  - `+` Kleene Plus (1 or more)
  - `?` Optional (0 or 1)
  - `( )` Arbitrary nested precedence grouping
  - `ε`, `eps`, `lambda`, `λ`, `\e` Native empty transitions
  - Alphanumeric alphabet: `[a-zA-Z0-9]`

</td>
<td width="50%" valign="top">

### ⚡ 2. 3-Stage Automata Synthesis
- **Thompson's Construction ($\varepsilon$-NFA):** Synthesizes inductive NFA sub-machines with initial and accepting states connected by $\varepsilon$-transitions.
- **Subset Construction (DFA):** Explores power sets of state closures via $\varepsilon\text{-closure}(S)$ and $\text{move}(T, a)$.
- **Hopcroft's Algorithm (Min-DFA):** $O(k \cdot n \log n)$ partition refinement algorithm to merge indistinguishable states and discard unreachable dead-ends.
- **Configurable Trap States:** Toggle complete 5-tuple DFA sinks ($\emptyset$) on or off with one switch.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎨 3. Interactive Visual Canvas
- **Draggable Physics Nodes:** Freely drag states across the viewport with automatic canvas bounds and auto-layout.
- **Bézier Curved Routing:** Separate forward arcs, backward loops, and self-transitions without edge collisions.
- **Vector & Raster Exports:** One-click instant **SVG** and **PNG** export for research papers, homework submissions, and slides.
- **Code Generation:** Instantly copy formatted **LaTeX TikZ / Tabular** code and **Mermaid.js** graph definitions.

</td>
<td width="50%" valign="top">

### 🧪 4. Tape Stepper & Batch Tester
- **Visual Input Tape:** Discrete Turing-style tape cells highlighting active symbols with an animated read head ($\Downarrow$).
- **VCR Playback Controller:** Full control with Step Backward (◀), Play/Pause (▶/⏸), Step Forward (▶), Reset (⏮), and Skip to End (⏭).
- **Variable Speeds:** Test at 0.5×, 1×, and 2× execution speed.
- **Bulk Test Matrix:** Run batches of test strings concurrently with instant Pass/Fail acceptance badges and single-click trace loading.

</td>
</tr>
</table>

---

## 🔬 Formal 5-Tuple Mathematical Output

For every generated machine, Forma calculates and renders the exact formal definition:

$$M = \langle Q, \Sigma, \delta, q_0, F \rangle$$

- **$Q$**: Finite set of states (e.g. $\{q_0, q_1, q_2, \dots\}$)
- **$\Sigma$**: Alphabet symbols detected in regex input
- **$\delta$**: Transition mapping table ($\delta: Q \times \Sigma \to Q$ or $2^Q$)
- **$q_0$**: Designated initial starting state
- **$F$**: Set of final accepting states ($F \subseteq Q$)

---

## 🚀 Quick Start

### 🌐 Use Immediately in Browser
No installation required! Visit the hosted deployment:
👉 **[Open Forma Studio](https://vedha-333.github.io/Forma-Computation-Automata-Studio-FLAT-Micro-Project-/)**

### 💻 Run Locally

#### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer)
- `npm` (bundled with Node.js)

```bash
# 1. Clone the repository
git clone https://github.com/vedha-333/Forma-Computation-Automata-Studio-FLAT-Micro-Project-.git

# 2. Navigate to project root
cd Forma-Computation-Automata-Studio-FLAT-Micro-Project-

# 3. Install dependencies
npm install

# 4. Start high-performance Vite dev server
npm run dev
```

Open your browser to `http://localhost:5173`.

#### Build for Production
```bash
npm run build
npm run preview
```

---

## 📁 Repository Structure

```
Forma-Computation-Automata-Studio-FLAT-Micro-Project-/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Pages CI/CD workflow
├── index.html              # Main HTML application shell & responsive layout
├── vite.config.js          # Vite build config with relative path handling
├── package.json            # Scripts, dev dependencies, and metadata
├── src/
│   ├── core/
│   │   ├── regex.js        # Tokenizer, infix-to-postfix & concatenation parser
│   │   ├── nfa.js          # Thompson's ε-NFA recursive algorithm
│   │   ├── dfa.js          # Subset construction (NFA → DFA power set)
│   │   ├── minimizer.js    # Hopcroft's partition refinement minimization
│   │   ├── simulator.js    # Input tape stepping & batch evaluation engine
│   │   └── formal.js       # 5-Tuple, LaTeX tabular/TikZ, and Mermaid exports
│   ├── ui/
│   │   ├── graph.js        # SVG canvas renderer with drag-and-drop & curves
│   │   ├── stepper.js      # Interactive input tape & playback controls
│   │   └── batch.js        # Batch test suite matrix runner
│   ├── main.js             # Application coordinator and UI event dispatch
│   └── style.css           # Premium dark-mode computational design system
└── README.md               # Project documentation & reference
```

---

## 🧠 Academic Algorithms

| Stage | Algorithm | Computational Complexity | Purpose |
|---|---|---|---|
| **Parsing** | **Dijkstra's Shunting-Yard** | $O(n)$ | Parses nested regex infix expressions with operator precedence and inserts concatenation tokens. |
| **NFA** | **Thompson's Construction** | $O(n)$ states & transitions | Constructs an $\varepsilon$-NFA with at most $2n$ states and single entry/exit invariant. |
| **DFA** | **Subset Construction** | $O(2^{|Q_{NFA}|})$ worst case | Computes $\varepsilon\text{-closure}$ and state sets to produce a deterministic automaton. |
| **Min-DFA** | **Hopcroft's Partitioning** | $O(k \cdot n \log n)$ | Refines equivalence classes of states to yield the unique canonical minimal DFA. |
| **Simulation** | **Single & Multi-Path Walker** | $O(m)$ for DFA, $O(m \cdot \|Q\|^2)$ for NFA | Evaluates input strings against state transitions with instantaneous step tracing. |

---

## 🛠️ Built With

- **Core:** Modern ES6+ JavaScript (zero heavy graph framework dependencies)
- **Visualization:** Native scalable SVG Vector Graphics with custom physics drag and Bézier math
- **Bundler & Tooling:** [Vite 6](https://vitejs.dev/)
- **Typography:** DM Mono, DM Sans, Manrope (Google Fonts)
- **Hosting & CI/CD:** GitHub Pages & GitHub Actions

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
  <sub>Engineered with precision for Formal Languages and Automata Theory. Star ⭐ the repository if you found this helpful!</sub>
</div>
