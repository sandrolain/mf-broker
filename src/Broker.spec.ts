import { Broker } from "./Broker";

describe("Broker", () => {

  test("Create Broker instance", async () => {
    const broker = new Broker();
    expect(broker).toBeInstanceOf(Broker);
  });

  test("Create Broker instance with argument", async () => {
    const broker = new Broker(window);
    expect(broker).toBeInstanceOf(Broker);
  });

  test("Subscribe to a topic as string", async () => {
    const broker = new Broker(window);
    const subscription = broker.subscribe("topicName", (data, event) => {
      data;
      event;
    });
    subscription.unsubscribe();
    expect(subscription.topic).toEqual("topicName");
  });

  test("Subscribe to a topic as array", async () => {
    const broker = new Broker(window);
    const subscription = broker.subscribe(["topic", "name"], (data, event) => {
      data;
      event;
    });
    subscription.unsubscribe();
    expect(subscription.topic).toEqual("topic:name");
  });

  test("Receive published data", (done) => {
    const broker = new Broker(window);
    const subscription = broker.subscribe(["topic", "name"], (data, event) => {
      subscription.unsubscribe();
      expect(data).toEqual({
        foo: "bar"
      });
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.detailInfo).toBeDefined();
      done();
    });
    broker.publish("topic:name", {
      foo: "bar"
    });
  });

  test("Receive retained data", (done) => {
    const broker = new Broker(window);
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

  test("Receive published data with publishWithTarget()", (done) => {
    const broker = new Broker(window);
    const subscription = broker.subscribe(["topic", "name3"], (data, event) => {
      subscription.unsubscribe();
      expect(data).toEqual({
        foo: "bar"
      });
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.detailInfo).toBeDefined();
      done();
    });
    broker.publishWithTarget(document.body, "topic:name3", {
      foo: "bar"
    });
  });

  test("Receive published data with publishCustom()", (done) => {
    const broker = new Broker(window);
    const date = new Date();
    const subscription = broker.subscribe(["topic", "name4"], (data, event) => {
      subscription.unsubscribe();
      expect(data).toEqual({
        foo: "bar"
      });
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.detailInfo).toBeDefined();
      expect(event.detailInfo.date).toEqual(date);
      expect(event.detailInfo.retain).toBeTruthy();
      expect(event.detailInfo.id).toEqual("abcd");
      done();
    });
    broker.publishCustom(document.body, "topic:name4", {
      date: date,
      retain: true,
      id: "abcd"
    }, {
      foo: "bar"
    });
  });

});
