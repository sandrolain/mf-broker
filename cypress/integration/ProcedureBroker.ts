/// <reference types="cypress" />
/// <reference types="chai" />

import type { ProcedureBroker } from "../../src";

describe("ProcedureBroker", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/index.html");
  });

  it("Test defined procedure", () => {
    cy.window().then(async (win) => {
      const broker = (win as any).procBroker as ProcedureBroker;
      const result = await broker.call("double", 128);
      expect(result).to.equal(256);
    });
  });

  it("Test errored procedure", () => {
    cy.window().then(async (win) => {
      const broker = (win as any).procBroker as ProcedureBroker;
      const result = await broker.call("get-error").catch((err) => err);
      expect(result).to.be.an("error");
    });
  });

  it("Test undefined procedure", () => {
    cy.window().then(async (win) => {
      const broker = (win as any).procBroker as ProcedureBroker;
      const result = await broker.call("not-exists", 128).catch((err) => err);
      expect(result).to.be.an("error");
    });
  });
});
