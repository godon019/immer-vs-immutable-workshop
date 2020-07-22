import { Map, Record } from "immutable";
import produce, { immerable } from "immer";

describe("declaration", () => {
  const obj = {
    foo: 1,
    inner: {
      bar: 10
    }
  };

  describe("immutable has to use toJS()", () => {
    describe("Map()", () => {
      const immutableMap = Map({
        foo: 1,
        inner: Map({
          bar: 10
        })
      });

      it("has to use toJS()", () => {
        // expect(immutableMap).toMatchObject(originalObj); // false
        expect(immutableMap.toJS()).toMatchObject(obj); // true
      });

      it("desctructure not available", () => {
        const { foo } = immutableMap;
        expect(foo).toBe(undefined);
      });
    });

    describe("Record()", () => {
      const recorded = Record({
        foo: 1,
        inner: {
          bar: 10
        }
      })();

      it("has to use toJS()", () => {
        // expect(recorded).toMatchObject(obj); // false
        expect(recorded.toJS()).toMatchObject(obj); // true
      });

      it("destructure available", () => {
        const { foo } = recorded;
        expect(foo).toBe(1);
      });
    });
  });
});

describe("get, set", () => {
  const obj = {
    foo: 1,
    notChange: {
      hey: "hey"
    },
    inner: {
      bar: 10
    }
  };

  // using spread operator is cumbersome
  const newObj = {
    foo: 1,
    notChange: {
      hey: "hey"
    },
    inner: {
      bar: 20
    }
  };

  describe("es6", () => {
    // using spread operator is cumbersome
    const es6 = {
      ...obj,
      inner: {
        ...obj.inner,
        bar: 20
      }
    };

    it("set", () => {
      expect(es6).toMatchObject(newObj);
    });

    it("get", () => {
      expect(obj.foo).toBe(es6.foo);
    });

    it("validate structural sharing", () => {
      expect(es6.notChange).toBe(obj.notChange);
      expect(es6.inner).not.toBe(newObj.inner);
    });
  });

  describe("Immutable", () => {
    describe("Map()", () => {
      const immutableMap = Map({
        foo: 1,
        notChange: {
          hey: "hey"
        },
        inner: {
          bar: 10
        }
      });

      const newMap = immutableMap.setIn(["inner", "bar"], 20);

      it("has to use setIn", () => {
        // unable to type-check the path
        expect(newMap.toJS()).toMatchObject(newObj);
      });

      it("has to use getIn", () => {
        // unable to type-check the path
        expect(newMap.getIn(["inner", "bar"])).toBe(20);
      });

      it("validate structural sharing", () => {
        expect(immutableMap.getIn(["notChange"])).toBe(
          newMap.getIn(["notChange"])
        );
        expect(immutableMap.getIn(["inner"])).not.toBe(newMap.getIn(["inner"]));
      });
    });

    describe("Record()", () => {
      const recorded = Record({
        foo: 1,
        notChange: {
          hey: "hey"
        },
        inner: {
          bar: 10
        }
      })();

      const newRecorded = recorded.setIn(["inner", "bar"], 20);

      it("has to use toJS()", () => {
        // unable to type-check the path
        expect(newRecorded.toJS()).toMatchObject(newObj);
      });

      it("get", () => {
        expect(newRecorded.inner.bar).toBe(20);
      });

      it("can use getIn()", () => {
        // unable to type-check the path
        expect(newRecorded.getIn(["inner", "bar"])).toBe(20);
      });

      it("validate structural sharing", () => {
        expect(recorded.notChange).toBe(newRecorded.notChange);
        expect(recorded.inner).not.toBe(newRecorded.inner);
      });

      it("validate structural sharing", () => {
        expect(recorded.getIn(["notChange"])).toBe(
          newRecorded.getIn(["notChange"])
        );
        expect(recorded.getIn(["inner"])).not.toBe(
          newRecorded.getIn(["inner"])
        );
      });
    });
  });

  describe("Immer", () => {
    // type-checked
    const immered = produce(obj, draft => {
      draft.inner.bar = 20;
    });

    it("set", () => {
      expect(immered).toMatchObject(newObj);
    });

    it("get", () => {
      expect(immered.inner.bar).toBe(newObj.inner.bar);
    });

    it("validate structural sharing", () => {
      expect(immered.notChange).toBe(obj.notChange);
      expect(immered.inner).not.toBe(newObj.inner);
    });
  });
});
