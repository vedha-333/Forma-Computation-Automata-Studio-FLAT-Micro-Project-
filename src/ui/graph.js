/**
 * Interactive SVG Graph Visualization Engine
 * Features: Draggable nodes, non-overlapping curved edges, multi-symbol edge merging,
 * dynamic active pulse highlights, zoom/pan, and PNG/SVG export.
 */

export class AutomataGraph {
  constructor(containerId, options = {}) {
    this.container = document.querySelector(containerId);
    this.svg = this.container.querySelector('svg') || this.container;
    this.automaton = null;
    this.scale = 1;
    this.nodePositions = new Map(); // id -> { x, y }
    this.activeState = null;
    this.visitedStates = new Set();
    this.activeTransition = null; // { from, to, symbol }

    this.draggedNodeId = null;
    this.dragOffset = { x: 0, y: 0 };
    this.isDragging = false;

    this.onNodeClick = options.onNodeClick || null;
    this.initEvents();
  }

  initEvents() {
    this.svg.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    window.addEventListener('pointerup', () => this.handlePointerUp());
    window.addEventListener('pointercancel', () => this.handlePointerUp());
  }

  setAutomaton(automaton) {
    this.automaton = automaton;
    this.activeState = automaton ? automaton.start : null;
    this.visitedStates = new Set(automaton ? [automaton.start] : []);
    this.activeTransition = null;
    this.calculateDefaultLayout();
    this.render();
  }

  calculateDefaultLayout() {
    if (!this.automaton || !this.automaton.states) return;

    this.nodePositions.clear();
    const states = this.automaton.states;
    const n = states.length;

    const width = Math.max(760, n * 140);
    const height = 360;
    const centerY = height / 2;

    if (n === 1) {
      this.nodePositions.set(states[0].id, { x: width / 2, y: centerY });
      return;
    }

    const marginX = 110;
    const stepX = (width - marginX * 2) / (n - 1);

    states.forEach((s, index) => {
      // Dynamic staggered height for cleaner edge clearance
      const offsetY = n > 3 ? (index % 2 === 1 ? 42 : -42) : 0;
      this.nodePositions.set(s.id, {
        x: marginX + index * stepX,
        y: centerY + offsetY
      });
    });
  }

  handlePointerDown(e) {
    const nodeGroup = e.target.closest('.automata-node');
    if (!nodeGroup) return;

    const nodeId = parseInt(nodeGroup.dataset.id, 10);
    const pos = this.nodePositions.get(nodeId);
    if (!pos) return;

    const svgRect = this.svg.getBoundingClientRect();
    const svgPoint = this.getSVGCoordinates(e.clientX, e.clientY);

    this.draggedNodeId = nodeId;
    this.dragOffset = {
      x: svgPoint.x - pos.x,
      y: svgPoint.y - pos.y
    };
    this.isDragging = true;
    nodeGroup.classList.add('dragging');
  }

  handlePointerMove(e) {
    if (!this.isDragging || this.draggedNodeId === null) return;

    const svgPoint = this.getSVGCoordinates(e.clientX, e.clientY);
    const newX = Math.max(50, Math.min(1600, svgPoint.x - this.dragOffset.x));
    const newY = Math.max(50, Math.min(600, svgPoint.y - this.dragOffset.y));

    this.nodePositions.set(this.draggedNodeId, { x: newX, y: newY });
    this.render();
  }

  handlePointerUp() {
    if (this.draggedNodeId !== null) {
      const nodeEl = this.svg.querySelector(`[data-id="${this.draggedNodeId}"]`);
      if (nodeEl) nodeEl.classList.remove('dragging');
    }
    this.isDragging = false;
    this.draggedNodeId = null;
  }

  getSVGCoordinates(clientX, clientY) {
    const pt = this.svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(this.svg.getScreenCTM().inverse());
  }

  setSimulationState(currentState, visited = [], activeTransition = null) {
    this.activeState = currentState;
    this.visitedStates = new Set(visited);
    this.activeTransition = activeTransition;
    this.render();
  }

  zoomIn() {
    this.scale = Math.min(2.0, this.scale + 0.15);
    this.applyZoom();
  }

  zoomOut() {
    this.scale = Math.max(0.5, this.scale - 0.15);
    this.applyZoom();
  }

  resetZoom() {
    this.scale = 1;
    this.calculateDefaultLayout();
    this.render();
    this.applyZoom();
  }

  applyZoom() {
    this.svg.style.transform = `scale(${this.scale})`;
    const label = document.querySelector('#zoomLabel');
    if (label) label.textContent = `${Math.round(this.scale * 100)}%`;
  }

  render() {
    if (!this.automaton || !this.automaton.states) {
      this.svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#66786c">No Automaton to display</text>';
      return;
    }

    const states = this.automaton.states;
    const n = states.length;
    const width = Math.max(760, n * 140);
    const height = 360;

    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.style.minWidth = `${width}px`;

    // Group transitions by from -> to
    const transitionMap = new Map(); // "from->to" => [symbols]

    if (this.automaton.type === 'NFA') {
      states.forEach(s => {
        s.edges.forEach(e => {
          const key = `${s.id}->${e.to}`;
          if (!transitionMap.has(key)) transitionMap.set(key, new Set());
          transitionMap.get(key).add(e.symbol);
        });
      });
    } else {
      states.forEach(s => {
        this.automaton.alphabet.forEach(sym => {
          const target = s.transitions[sym];
          if (target !== null && target !== undefined) {
            const key = `${s.id}->${target}`;
            if (!transitionMap.has(key)) transitionMap.set(key, new Set());
            transitionMap.get(key).add(sym);
          }
        });
      });
    }

    // Render Edges
    const edgesMarkup = [];
    const R = 28; // State radius

    transitionMap.forEach((symbolsSet, key) => {
      const [fromIdStr, toIdStr] = key.split('->');
      const fromId = parseInt(fromIdStr, 10);
      const toId = parseInt(toIdStr, 10);
      const p1 = this.nodePositions.get(fromId) || { x: 100, y: 180 };
      const p2 = this.nodePositions.get(toId) || { x: 250, y: 180 };
      const symbols = Array.from(symbolsSet).join(', ');

      const isSelf = fromId === toId;
      const isReversePair = transitionMap.has(`${toId}->${fromId}`) && fromId !== toId;
      const isActive = this.activeTransition &&
        this.activeTransition.from === fromId &&
        this.activeTransition.to === toId &&
        symbolsSet.has(this.activeTransition.symbol);

      let pathD = '';
      let textX = 0;
      let textY = 0;

      if (isSelf) {
        // Elevated Self Loop
        pathD = `M ${p1.x - 12} ${p1.y - R} C ${p1.x - 46} ${p1.y - R - 60}, ${p1.x + 46} ${p1.y - R - 60}, ${p1.x + 12} ${p1.y - R}`;
        textX = p1.x;
        textY = p1.y - R - 48;
      } else if (fromId < toId) {
        // Forward Transition (arch upward)
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curveOffset = Math.min(80, 20 + dist * 0.12 + (isReversePair ? 20 : 0));

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - curveOffset;

        // Angle
        const angle = Math.atan2(dy, dx);
        const startX = p1.x + R * Math.cos(angle - 0.2);
        const startY = p1.y + R * Math.sin(angle - 0.2);
        const endX = p2.x - R * Math.cos(angle + 0.2);
        const endY = p2.y - R * Math.sin(angle + 0.2);

        pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        textX = midX;
        textY = midY - 6;
      } else {
        // Backward Transition (arch downward)
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curveOffset = Math.min(90, 25 + dist * 0.14 + (isReversePair ? 20 : 0));

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + curveOffset;

        const angle = Math.atan2(dy, dx);
        const startX = p1.x + R * Math.cos(angle + 0.2);
        const startY = p1.y + R * Math.sin(angle + 0.2);
        const endX = p2.x - R * Math.cos(angle - 0.2);
        const endY = p2.y - R * Math.sin(angle - 0.2);

        pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        textX = midX;
        textY = midY + 16;
      }

      edgesMarkup.push(`
        <g class="automata-edge-group ${isActive ? 'edge-active-group' : ''}">
          <path class="edge ${isActive ? 'edge-active' : ''}" d="${pathD}" marker-end="url(#arrow)" />
          <text class="edge-label ${isActive ? 'edge-label-active' : ''}" x="${textX}" y="${textY}">${symbols}</text>
        </g>
      `);
    });

    // Render Nodes
    const nodesMarkup = states.map(s => {
      const pos = this.nodePositions.get(s.id) || { x: 100, y: 180 };
      const isStart = s.id === this.automaton.start;
      const isAccept = this.automaton.acceptStates.includes(s.id);
      const isCurrent = this.activeState === s.id;
      const isVisited = this.visitedStates.has(s.id);

      const nodeClasses = [
        'automata-node',
        isStart ? 'start' : '',
        isAccept ? 'accept' : '',
        isVisited ? 'visited' : '',
        isCurrent ? 'current' : ''
      ].filter(Boolean).join(' ');

      const subsetLabel = s.set ? `{${s.set.join(',')}}` : (s.originalStates ? `{${s.originalStates.join(',')}}` : '');

      return `
        <g class="${nodeClasses}" data-id="${s.id}" transform="translate(${pos.x}, ${pos.y})">
          ${isStart ? `<path class="start-arrow" d="M -65 0 L -36 0" marker-end="url(#arrow)" />` : ''}
          <circle class="node-shadow" r="30" />
          <circle class="node-face" r="26" />
          ${isAccept ? '<circle class="accept-ring" r="32" />' : ''}
          <text class="node-label" y="5">${s.name || `q${s.id}`}</text>
          ${subsetLabel ? `<text class="subset-label" y="48">${subsetLabel}</text>` : ''}
        </g>
      `;
    }).join('');

    this.svg.innerHTML = `
      <defs>
        <marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M 0 1.5 L 7 4.5 L 0 7.5 z" fill="#9ab5a6" />
        </marker>
        <marker id="arrow-active" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
          <path d="M 0 1.5 L 7 4.5 L 0 7.5 z" fill="#c5e7c0" />
        </marker>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g class="edges-layer">${edgesMarkup.join('')}</g>
      <g class="nodes-layer">${nodesMarkup}</g>
    `;

    this.applyZoom();
  }

  exportSVG() {
    const svgClone = this.svg.cloneNode(true);
    svgClone.removeAttribute('style');
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `automaton_${this.automaton.type.toLowerCase()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportPNG() {
    const svgData = new XMLSerializer().serializeToString(this.svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = this.svg.viewBox.baseVal.width || 800;
      canvas.height = this.svg.viewBox.baseVal.height || 400;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#101413';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `automaton_${this.automaton.type.toLowerCase()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }
}
