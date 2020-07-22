import { Map, Record } from "immutable";
import produce, { immerable } from "immer";

export const basic = () => {
  // 객체는 Map
  const obj = Map({
    foo: 1,
    inner: Map({
      bar: 10
    })
  });
  // have to use toJS()
  console.log("obj", obj.toJS());

  // have to use setIn() getIn()
  const nextObj = obj.setIn(["inner", "bar"], 20);
  console.log(nextObj.getIn(["inner", "bar"])); // 20
  // structural sharing?
  console.log(
    "structural sharing on Map()?",
    obj.getIn(["foo"]) === nextObj.getIn(["foo"])
  );

  // Record for rescue ?
  const Person = Record({
    name: "Siots",
    age: 1
  });

  let person = Person();

  console.log("record usage");
  // have to use toJS() ?
  console.log("person", person.toJS());
  // no need to use get()
  console.log("name", person.name);
  const { name, age } = person;
  console.log("destructuring", name, age);

  // nested object works?
  const NestedObj = Record({
    name: "Gordon",
    nested: {
      company: "zoyi"
    }
  });
  const nestedObj = NestedObj();
  // it works without using Record() on `nested` property

  // using `Record()` and instantiating statement could be cumbersome

  // still I have to use toJS()
  console.log("nested Object", nestedObj.toJS());
  console.log("access to nested property", nestedObj.nested.company);

  // Immer

  const todos = [
    { text: "아구찜 먹기", done: false },
    { text: "브래드피트 사진 보기", done: false }
  ];

  // draft is typed
  const nextTodos = produce(todos, draft => {
    draft.push({ text: "Immer 배우기", done: true });
    draft[1].done = true;
  });

  // old state is unmodified
  console.log(todos.length); // 2
  console.log(todos[1].done); // false

  // new state reflects the draft
  console.log(nextTodos.length); // 3
  console.log(nextTodos[1].done); // true

  // structural sharing
  console.log(todos === nextTodos); // false
  console.log(todos[0] === nextTodos[0]); // true
  console.log(todos[1] === nextTodos[1]); // false
};

export const immerTest = () => {
  const state = {
    foo: "1",
    bar: {
      barFoo: 2,
      awesome: {
        some: "some",
        great: "yes"
      }
    }
  };
  type State = typeof state;

  const withSpread = (state: State) => ({
    ...state,
    bar: {
      ...state.bar,
      awesome: {
        ...state.bar.awesome,
        great: "here I am!"
      }
    }
  });

  console.log(JSON.stringify(withSpread(state), null, 2));

  // todo: I might time this function
  const withProduce = (state: State) =>
    produce(state, draft => {
      // check the 'draft' is not returned
      draft.bar.awesome.great = "here I am!";
    });

  console.log(JSON.stringify(withProduce(state), null, 2));
};

export const classTest = () => {
  class Greeter {
    // this symbol enables the class to be compatible with Immer
    [immerable] = true;
    greeting: string;
    constructor(message: string) {
      this.greeting = message;
    }
    greet() {
      return "Hello, " + this.greeting;
    }
  }

  let greeter = new Greeter("world");
  console.log(greeter);
  console.log("greeter.greet()", greeter.greet());

  const produced = produce(greeter, draft => {
    draft.greeting = "Universe";
  });
  console.log(produced);
  console.log("greet produced", produced.greet());

  // todo: now test the class extends ExtendedMap
};

export const extendedClassTest = () => {
  class ExtendedMap {
    private privateGreeting: string;
    constructor(privateGreeting: string) {
      this.privateGreeting = privateGreeting;
    }
    privateGreet() {
      return "Hello, privately " + this.privateGreeting;
    }
    setPrivateGreet(str: string) {
      this.privateGreeting = str;
    }
  }
  class Greeter extends ExtendedMap {
    // this symbol enables the class to be compatible with Immer
    [immerable] = true;
    greeting: string;
    constructor(message: string) {
      super(message + " yo");
      this.greeting = message;
    }
    greet() {
      return "Hello, " + this.greeting;
    }
  }

  let greeter = new Greeter("world");
  console.log(greeter);
  console.log("greeter.greet()", greeter.greet());
  console.log("greeter.privateGreet()", greeter.privateGreet());

  const produced = produce(greeter, draft => {
    draft.greeting = "Universe";
    // doesn't work
    draft.setPrivateGreet("err");
  });
  console.log(produced);
  console.log("greet produced", produced.greet());
  console.log("greeter.privateGreet()", greeter.privateGreet());
  greeter.setPrivateGreet("what");
  console.log("greeter.privateGreet()", greeter.privateGreet());

  // todo: now test the class extends ExtendedMap
};

// immerTest();
// classTest();
extendedClassTest();
