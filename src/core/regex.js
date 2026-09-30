/**
 * Regular Expression Lexer and Parser (Shunting-Yard algorithm)
 * Supports: Alphanumeric characters [a-zA-Z0-9], Epsilon (ε, eps, λ, etc.),
 * Union (|), Concatenation (implicit or ·), Kleene Star (*), Kleene Plus (+), Optional (?)
 */

export const EPSILON = 'ε';

/**
 * Normalizes input regex string:
 * - Trims extra whitespace
 * - Replaces common epsilon notations (eps, EPS, epsilon, lambda, λ, \e, e/E when typed as epsilon)
 */
export function normalizeRegex(input) {
  if (!input) return '';
  let str = input.trim();
  // Replace explicit keywords for epsilon with canonical ε
  str = str.replace(/\\e|\\eps|epsilon|eps|lambda|λ/gi, EPSILON);
  return str;
}

/**
 * Tokenizes regex string into an array of tokens.
 */
export function tokenize(input) {
  const str = normalizeRegex(input);
  if (!str) {
    throw new Error('Please enter a regular expression to proceed.');
  }

  const tokens = [];
  let i = 0;

  while (i < str.length) {
    const char = str[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Supported alphanumeric atoms or canonical epsilon
    if (/[a-zA-Z0-9]/.test(char) || char === EPSILON) {
      tokens.push(char);
      i++;
    } else if ('|*+?()·'.includes(char)) {
      tokens.push(char);
      i++;
    } else {
      throw new Error(`Unsupported character "${char}" at position ${i + 1}. Use alphanumeric symbols or operators (| * + ? ()).`);
    }
  }

  if (tokens.length === 0) {
    throw new Error('Empty regular expression.');
  }

  return tokens;
}

/**
 * Converts infix regex tokens to postfix (Reverse Polish Notation) with explicit concatenation operator '·'.
 */
export function toPostfix(tokens) {
  if (!tokens || tokens.length === 0) {
    throw new Error('Empty regular expression.');
  }

  // Insert explicit concatenation operator '·'
  const canEnd = t => /^[a-zA-Z0-9ε]$/.test(t) || t === ')' || t === '*' || t === '+' || t === '?';
  const canStart = t => /^[a-zA-Z0-9ε]$/.test(t) || t === '(';

  const expanded = [];
  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];
    if (i > 0 && canEnd(tokens[i - 1]) && canStart(curr)) {
      expanded.push('·');
    }
    expanded.push(curr);
  }

  // Operator precedence
  const precedence = {
    '|': 1,
    '·': 2,
    '*': 3,
    '+': 3,
    '?': 3
  };

  const output = [];
  const opStack = [];

  for (let i = 0; i < expanded.length; i++) {
    const token = expanded[i];

    if (/^[a-zA-Z0-9ε]$/.test(token)) {
      output.push(token);
    } else if (token === '(') {
      opStack.push(token);
    } else if (token === ')') {
      while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
        output.push(opStack.pop());
      }
      if (opStack.length === 0) {
        throw new Error('Unmatched closing parenthesis ")" in expression.');
      }
      opStack.pop(); // Pop '('
    } else if (token === '*' || token === '+' || token === '?') {
      // Unary postfix operators bind directly with high precedence
      output.push(token);
    } else if (token === '|' || token === '·') {
      // Check for syntax errors like trailing or consecutive operators
      if (i === 0 || i === expanded.length - 1) {
        throw new Error(`Operator "${token}" cannot appear at the start or end of an expression.`);
      }
      const prev = expanded[i - 1];
      if (prev === '(' || prev === '|' || prev === '·') {
        throw new Error(`Invalid syntax near operator "${token}".`);
      }

      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1] !== '(' &&
        precedence[opStack[opStack.length - 1]] >= precedence[token]
      ) {
        output.push(opStack.pop());
      }
      opStack.push(token);
    }
  }

  while (opStack.length > 0) {
    const op = opStack.pop();
    if (op === '(') {
      throw new Error('Unmatched opening parenthesis "(" in expression.');
    }
    output.push(op);
  }

  if (output.length === 0) {
    throw new Error('Invalid regular expression.');
  }

  return output;
}
