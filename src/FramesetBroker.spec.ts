import { Broker } from "./Broker";
import { FramesetBroker } from "./FramesetBroker";

const topFrameBroker = new Broker(window);

describe("FramesetBroker", () => {

  test("Create FramesetBroker instance", async () => {
    const broker = new FramesetBroker(topFrameBroker);
    expect(broker).toBeInstanceOf(FramesetBroker);
  });

  test("Create FramesetBroker instance with argument", async () => {
    const broker = new FramesetBroker(topFrameBroker);
    expect(broker).toBeInstanceOf(FramesetBroker);
  });

  test("Subscribe to a topic as string", async () => {
    const broker = new FramesetBroker(topFrameBroker);
    const subscription = broker.subscribe("topicName", (data, event) => {
      data;
      event;
    });
    subscription.unsubscribe();
    expect(subscription.topic).toEqual("topicName");
  });

  test("Subscribe to a topic as array", async () => {
    const broker = new FramesetBroker(topFrameBroker);
    const subscription = broker.subscribe(["topic", "name"], (data, event) => {
      data;
      event;
    });
    subscription.unsubscribe();
    expect(subscription.topic).toEqual("topic:name");
  });

  test("Receive published data", (done) => {
    const broker = new FramesetBroker(topFrameBroker);
    const subscription = broker.subscribe(["topic", "name1"], (data, event) => {
      subscription.unsubscribe();
      expect(data).toEqual({
        foo: "bar"
      });
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.detailInfo).toBeDefined();
      done();
    });
    broker.publish("topic:name1", {
      foo: "bar"
    });
  });

  test("Receive retained data", (done) => {
    const broker = new FramesetBroker(topFrameBroker);
    broker.publish("topic:name2", {
      foo: "bar"
    }, true);
    const subscription = broker.subscribe(["topic", "name2"], (data, event) => {
      subscription.unsubscribe();
      expect(data).toEqual({
        foo: "bar"
      });
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.detailInfo.retain).toBeTruthy();
      done();
    });
  });

  // TODO: JSDOM do not support correctly "origin" into MessageEvent
  test("Receive published into child frame", (done) => {
    const frame = window.document.createElement("iframe");
    window.document.body.appendChild(frame);
    const frameWindow = frame.contentWindow;

    const broker = new FramesetBroker(topFrameBroker);
    const frameBroker = new FramesetBroker(new Broker(frameWindow));
    const subscription = frameBroker.subscribe(["topic", "name", "sub"], (data, event) => {
      subscription.unsubscribe();
      expect(data).toEqual({
        foo: "bar"
      });
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.detailInfo).toBeDefined();
      done();
    });
    broker.publish("topic:name:sub", {
      foo: "bar"
    });
  });

});
