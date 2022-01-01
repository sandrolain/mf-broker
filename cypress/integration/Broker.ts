/// <reference types="cypress" />

import type { Broker } from "../../src";

describe("Broker", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/index.html");
  });

  it("Test publish", () => {
    const topicReceived = cy.stub().as("topicReceived");
    cy.window().then((win) => {
      win.addEventListener("test:topic", topicReceived);
    });
    cy.get("#publish").click();
    cy.window().then((win) => {
      const broker = (win as any).broker as Broker;
      broker.subscribe("test:topic", topicReceived);
    });
    cy.wait(100);
    cy.get("@topicReceived").should("have.been.calledOnce");
  });

  it("Test retain publish", () => {
    const topicReceived = cy.stub().as("topicReceived");
    cy.window().then((win) => {
      win.addEventListener("test:topic", topicReceived);
    });
    cy.get("#publishr").click();
    cy.window().then((win) => {
      const broker = (win as any).broker as Broker;
      broker.subscribe("test:topic", topicReceived);
    });
    cy.wait(100);
    cy.get("@topicReceived").should("have.been.calledTwice");
  });
});
