// An interpreter for the Language Bella

type Value = number | boolean | ((...args: number[]) => number);
type Memory = Map<string, Value>;

class Program {
  constructor(public body: Block) {}
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

    this.body.interpret(memory);
  }
}

class Block {
  constructor(public statements: Statement[]) {}
  interpret(memory: Memory) {
    for (const statement of this.statements) {
      return statement.interpret(memory);
    }
  }
}

interface Statement {
  interpret(memory: Memory): void;
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

class Assignment implements Statement {
  constructor(public target: Identifier, public source: Expression) {}
  interpret(memory: Memory) {
    if (!memory.has(this.target.name)) {
      throw new Error(`Unknown variable: ${this.target.name}`);
    }
    memory.set(this.target.name, this.source.interpret(memory));
  }
}

class PrintStatement implements Statement {
  constructor(public expression: Expression) {}
  interpret(memory: Memory) {
    console.log(this.expression.interpret(memory));
  }
}

// class While implements Statement {
//   constructor(public expression: Expression, public block: Block) {}
// }

// class Function implements Statement {
//   constructor(
//     public name: Identifier,
//     public args: Expression[],
//     public expression: Expression
//   ) {}
// }

interface Expression {
  interpret(memory: Memory): any; //changed this to any since it can be a boolean or a number- don't know if that was the right call
}

class BinaryExp implements Expression {
  constructor(
    public operator: string,
    public left: Expression,
    public right: Expression
  ) {}

  interpret(memory: Memory): number | boolean {
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
      case "<":
        return this.left.interpret(memory) < this.right.interpret(memory);
      case "<=":
        return this.left.interpret(memory) <= this.right.interpret(memory);
      case "==":
        return this.left.interpret(memory) === this.right.interpret(memory);
      case "!=":
        return this.left.interpret(memory) !== this.right.interpret(memory);
      case ">=":
        return this.left.interpret(memory) >= this.right.interpret(memory);
      case ">":
        return this.left.interpret(memory) > this.right.interpret(memory);
      case "&&":
        return this.left.interpret(memory) && this.right.interpret(memory);
      case "||":
        return this.left.interpret(memory) || this.right.interpret(memory);
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

class ConditionalExpression implements Expression {
  constructor(
    public exp_true: Expression,
    public condition: Expression,
    public exp_false: Expression
  ) {}
  interpret(memory: Memory): number | boolean {
    return this.exp_true.interpret(memory)
      ? this.condition.interpret(memory)
      : this.exp_false.interpret(memory);
  }
}

class Call implements Expression {
  constructor(public callee: Identifier, public args: Expression[]) {}
  interpret(memory: Memory): number {
    const func = memory.get(this.callee.name);
    if (typeof func !== "function") {
      throw new Error(`Unknown function: ${this.callee.name}`);
    }
    return func(...this.args.map((arg) => arg.interpret(memory)));
  }
}

class Identifier implements Expression {
  constructor(public name: string) {}
  interpret(memory: Memory): number {
    const value = memory.get(this.name);
    console.log(typeof value);
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
  constructor(public value: boolean) {}
  interpret() {
    return this.value;
  }
}

function interpret(program: Program): void {
  program.interpret();
}

const sample: Program = new Program(
  new Block([
    new PrintStatement(new Numeral(5)),
    // new Assignment(new Identifier("x"), new UnaryExp("-", new Numeral(20))),
    // its not liking assignment for some reason
    // new PrintStatement(new BinaryExp("*", new Numeral(9), new Identifier("x"))),
    new PrintStatement(new Call(new Identifier("sqrt"), [new Numeral(2)])),
  ])
);

interpret(sample);
