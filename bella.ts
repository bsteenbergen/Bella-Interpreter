// An interpreter for the Language Bella

type Value = number | boolean | ((...args: number[]) => number);
type Memory = Map<string, Value>;

class Program {
  constructor(public body: Block) {}
  // interpret(memory: Memory): void;
}

class Block {
  constructor(public statements: Statement[]) {
  interpret() {
    // Bella built ins
    const memory = new Map();
    memory.set("sin", Math.sin);
    memory.set("cos", Math.cos);
    memory.set("hypot", Math.hypot);
    memory.set("sqrt", Math.sqrt);
    memory.set("π", Math.PI);
    memory.set("exp", Math.exp);
    memory.set("ln", Math.LN10); // can also be Math.LN2 but I don't remember my logs 

    for (const stmt of this.statements) {
        stmt.interpret(memory);
    }
  }
}

interface Statement {  
    interpret(memory: Memory): void;
}

class Assignment implements Statement {
  constructor(public target: Identifier, public source: Expression) {}
  interpret(memory: Memory) {
    if (!memory.has(this.target.name)) {
      throw new Error(`Unknown variable: ${this.target.name}`);
    }
    memory.set(this.target.name, this.source.interpret(memory));
  }
}

class VariableDeclaration implements Statement {
  constructor(public id: Identifier, public initializer: Expression) {}
  interpret(memory: Memory) {
    if (memory.has(this.id.name)) {
      throw new Error(`Variable already declared: ${this.id.name}`);
    }
    memory.set(this.id.name, this.initializer.interpret(memory));
  }
}

class PrintStatement implements Statement {
    constructor(public expression: Expression) {}
    interpret(memory: Memory) {
      console.log(this.expression.interpret(memory));
    }
}

class While implements Statement {
    constructor(public expression: Expression, public block: Block) {}
}

class Function implements Statement {
    constructor(public name: Identifier, public args: Expression[], public expression: Expression) {}
}

interface Expression {
    interpret(memory: Memory): any; //changed this to any since it can be a boolean or a number- don't know if that was the right call
}

class BinaryExp implements Expression {
    constructor(
      public operator: string,
      public left: Expression,
      public right: Expression
    ) {}
    
    interpret(memory: Memory): number { 
      switch (this.operator) {
        case "+":
          return this.left.interpret(memory) + this.right.interpret(memory);
        case "-":
          return this.left.interpret(memory) - this.right.interpret(memory);
        case "*":
          return this.left.interpret(memory) * this.right.interpret(memory);
        case "/":
          return this.left.interpret(memory) / this.right.interpret(memory);
        case "%":
          return this.left.interpret(memory) % this.right.interpret(memory);
        case "**":
          return this.left.interpret(memory) ** this.right.interpret(memory);
        default:
          throw new Error(`Unknown operator: ${this.operator}`);
      }
    }
  }
  
  class UnaryExp implements Expression {
    constructor(public operator: string, public operand: Expression) {}
    interpret(memory: Memory): number | boolean {
      switch (this.operator) {
        case "-":
          return -this.operand.interpret(memory);
        case "!":
          return !this.operand.interpret(memory);
        default:
          throw new Error(`Unknown operator: ${this.operator}`);
      }
    }
  }
  
  class Call implements Expression {
    constructor(public callee: Identifier, public args: Expression[]) {}
    interpret(memory: Memory): number {
      const fn = memory.get(this.callee.name);
      if (typeof fn !== "function") {
        throw new Error(`Unknown function: ${this.callee.name}`);
      }
      return fn(...this.args.map((arg) => arg.interpret(memory)));
    }
  }

class Identifier implements Expression {
    constructor(public name: string) {}
    interpret(memory: Memory): number {
      const value = memory.get(this.name);
      if (value === undefined) {
        throw new Error(`Unknown variable: ${this.name}`);
      } else if (typeof value !== "number") {
        throw new Error(`Variable is not a number: ${this.name}`);
      }
      return value;
    }
  }

  class Numeral implements Expression {
    constructor(public value: number) {}
    interpret() {
      return this.value;
    }
  }

  class Bool implements Expression {
    constructor(public value: boolean ) {}
    interpret() {
      return this.value;
    }
  }
// Build the rest of the classes and interfaces here: PrintStatement,
// BinaryExpression, UnaryExpression, ConditionalExpression, Numeral,
// Identifier, etc.

function interpret(program: Program): void {
    program.interpret();
}
