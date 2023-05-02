// An interpreter for the Language Bella

type Value =
  | number
  | boolean
  | Value[]
  | ((...args: number[]) => Value)
  | [Identifier[], Expression];

let memory = new Map<string, Value>();

class Program {
  constructor(public body: Block) {}
  interpret() {
    // Bella built ins
    memory.set("sin", Math.sin);
    memory.set("cos", Math.cos);
    memory.set("hypot", Math.hypot);
    memory.set("sqrt", Math.sqrt);
    memory.set("π", Math.PI);
    memory.set("exp", Math.exp);
    memory.set("ln", Math.LN10); // can also be Math.LN2 but I don't remember my logs
    return this.body.interpret();
  }
}

class Block {
  constructor(public statements: Statement[]) {}
  interpret() {
    for (const statement of this.statements) {
      statement.interpret();
    }
  }
}

interface Statement {
  interpret(): void;
}

class VariableDeclaration implements Statement {
  constructor(public id: Identifier, public initializer: Expression) {}
  interpret(): void {
    if (memory.has(this.id.name)) {
      throw new Error(`Variable already declared: ${this.id.name}`);
    }
    memory.set(this.id.name, this.initializer.interpret());
  }
}

class Assignment implements Statement {
  constructor(public target: Identifier, public source: Expression) {}
  interpret(): void {
    if (!memory.has(this.target.name)) {
      throw new Error(`Unknown variable: ${this.target.name}`);
    }
    memory.set(this.target.name, this.source.interpret());
  }
}

class PrintStatement implements Statement {
  constructor(public expression: Expression) {}
  interpret(): void {
    console.log(this.expression.interpret());
  }
}

class While implements Statement {
  constructor(public expression: Expression, public block: Block) {}
  interpret(): void {
    while (this.expression.interpret()) {
      this.block.interpret();
    }
  }
}

class FunctionStatement implements Statement {
  constructor(
    public id: Identifier,
    public args: Expression[],
    public expression: Expression
  ) {}

  interpret(): void {
    memory.set(this.id.name, [
      this.args.map((arg) => arg as Identifier),
      this.expression,
    ]);
  }
}

interface Expression {
  interpret(): Value;
}

class BinaryExp implements Expression {
  constructor(
    public operator: string,
    public left: Expression,
    public right: Expression
  ) {}

  interpret(): Value {
    const left = this.left.interpret();
    const right = this.right.interpret();
    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error("Must be a number to use arithmetic operations");
    } else {
      switch (this.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "%":
          return left % right;
        case "**":
          return left ** right;
      }
    }
    switch (this.operator) {
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case "==":
        return left === right;
      case "!=":
        return left !== right;
      case ">=":
        return left >= right;
      case ">":
        return left > right;
      case "&&":
        return left && right;
      case "||":
        return left || right;
      default:
        throw new Error(`Unknown operator: ${this.operator}`);
    }
  }
}

class UnaryExp implements Expression {
  constructor(public operator: string, public operand: Expression) {}
  interpret(): Value {
    switch (this.operator) {
      case "-":
        return -this.operand.interpret();
      case "!":
        return !this.operand.interpret();
      default:
        throw new Error(`Unknown operator: ${this.operator}`);
    }
  }
}

class ConditionalExpression implements Expression {
  constructor(
    public test: Expression,
    public consequent: Expression,
    public alternate: Expression
  ) {}
  interpret(): Value {
    return this.test.interpret()
      ? this.consequent.interpret()
      : this.alternate.interpret();
  }
}

class Call implements Expression {
  constructor(public callee: Identifier, public args: Expression[]) {}
  interpret(): Value {
    const functionValue = memory.get(this.callee.name);
    if (typeof functionValue !== "function") {
      throw new Error(`Value is not a function: ${this.callee.name}`);
    }
    return functionValue(this.args.map((arg) => arg.interpret()));
  }
}

class ArrayLiteral implements Expression {
  constructor(public elements: Expression[]) {}
  interpret(): Value {
    return this.elements.map((e) => e.interpret());
  }
}

class Subscript implements Expression {
  constructor(public array: Expression, public subscript: Expression) {}
  interpret(): Value {
    const arrayValue = this.array.interpret();
    const subscriptValue = this.subscript.interpret();
    if (!Array.isArray(arrayValue)) {
      throw new Error("Subscripted item must be an array");
    }
    if (typeof subscriptValue !== "number") {
      throw new Error("Subscript value must be a number");
    }
    return arrayValue[subscriptValue];
  }
}

class Identifier implements Expression {
  constructor(public name: string) {}
  interpret(): Value {
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
  interpret(): Value {
    return this.value;
  }
}

class Bool implements Expression {
  constructor(public value: boolean) {}
  interpret(): Value {
    return this.value;
  }
}

// Run the interpreter

function interpret(program: Program): void {
  program.interpret();
}

const sample: Program = new Program(
  new Block([
    new VariableDeclaration(new Identifier("x"), new Numeral(100)),
    new Assignment(new Identifier("x"), new UnaryExp("-", new Numeral(20))),
    new PrintStatement(new BinaryExp("*", new Numeral(9), new Identifier("x"))),
    new PrintStatement(new Call(new Identifier("sqrt"), [new Numeral(2)])),
    new PrintStatement(
      new ConditionalExpression(
        new BinaryExp("<", new Numeral(3), new Numeral(2)),
        new Numeral(1),
        new Numeral(0)
      )
    ),

    // While test
    new VariableDeclaration(new Identifier("y"), new Numeral(0)),
    new While(
      new BinaryExp(">", new Numeral(10), new Identifier("y")),
      new Block([
        new Assignment(
          new Identifier("y"),
          new BinaryExp("+", new Numeral(1), new Identifier("y"))
        ),
      ])
    ),
    new PrintStatement(new Identifier("y")),

    // FunctionStatement test
    new VariableDeclaration(new Identifier("i"), new Numeral(0)),
    new FunctionStatement(
      new Identifier("plusFour"),
      [new Identifier("i")],
      new BinaryExp("+", new Identifier("z"), new Numeral(4))
    ),
    new Call(new Identifier("plusFour"), [new Identifier("i")]),
    new PrintStatement(new Identifier("i")),
  ])
);

interpret(sample);
