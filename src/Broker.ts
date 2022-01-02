import { v4 as uuidv4 } from "uuid";

// TODO: docs
export type BrokerTopic = string | string[];
// TODO: docs
export type BrokerTopicCallback<T=any> = (data: T, event: BrokerCustomEvent<T>) => void;
// TODO: docs
export type BrokerTarget = Window | Document | HTMLElement;

// TODO: docs
export interface BrokerSubscription {
  broker: Broker;
  topic: string;
  callback: BrokerTopicCallback;
  unsubscribe: () => void;
}

// TODO: docs
export interface BrokerCustomEventInfo {
  date: Date;
  retain: boolean;
  id: string;
}

// TODO: docs
export type BrokerCustomEvent<T> = CustomEvent<T> & { detailInfo?: BrokerCustomEventInfo };

// TODO: docs
export interface BrokerRetainedData {
  info: BrokerCustomEventInfo;
  data: any;
  event: Event;
}

interface BrokerTargetExtension {
  __MfBrokerRetained: BrokerRetainedMap;
  __MfBrokerTargetId: string;
  __MfBrokerInstance: Broker;
}

type BrokerTargetExtended = Window & BrokerTargetExtension;

type BrokerRetainedMap = Map<string, BrokerRetainedData>;

export interface BrokerInterface {
  getTarget (): Window;
  getTargetId (): string;
  publish<T=any> (topic: BrokerTopic, data: T, retain: boolean): BrokerRetainedData;
  subscribe<T=any> (topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription;
  getRetained (topic: BrokerTopic): BrokerRetainedData;
}

// TODO: docs
export class Broker implements BrokerInterface {

  constructor (readonly target: Window = window) {
    const targetExt = this.target as BrokerTargetExtended;
    targetExt.__MfBrokerRetained = new Map();
  }

  // TODO: docs
  // TODO: test
  getTarget (): Window {
    return this.target;
  }

  // TODO: docs
  // TODO: test
  getTargetId (): string {
    const targetExt = this.target as BrokerTargetExtended;
    if(!targetExt.__MfBrokerTargetId) {
      targetExt.__MfBrokerTargetId = `T-${uuidv4()}`;
    }
    return targetExt.__MfBrokerTargetId;
  }

  // TODO: docs
  // TODO: test
  publish<T=any> (topic: BrokerTopic, data: T, retain: boolean = false): BrokerRetainedData {
    return this.publishWithTarget<T>(this.target, topic, data, retain);
  }

  // TODO: docs
  // TODO: test
  publishWithTarget<T=any> (target: BrokerTarget, topic: BrokerTopic, data: T, retain: boolean = false): BrokerRetainedData {
    const info: BrokerCustomEventInfo = {
      date: new Date(),
      retain,
      id: `E-${uuidv4()}`
    };
    return this.publishCustom(target, topic, info, data);
  }

  // TODO: docs
  // TODO: test
  publishCustom<T=any> (target: BrokerTarget, topic: BrokerTopic, info: BrokerCustomEventInfo, data: T): BrokerRetainedData {
    const targetExt = this.target as BrokerTargetExtended;
    const topicStr  = Broker.topicAsString(topic);
    const event: BrokerCustomEvent<T> = new CustomEvent(topicStr, {
      detail: data,
      bubbles: true,
      cancelable: false,
      composed: true
    });
    event.detailInfo = info;
    const retainData = { data, info, event };
    if(info.retain) {
      targetExt.__MfBrokerRetained.set(topicStr, retainData);
    }
    target.dispatchEvent(event);
    return retainData;
  }

  // TODO: docs
  // TODO: test
  subscribe<T=any> (topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription {
    const targetExt = this.target as BrokerTargetExtended;
    const topicStr     = Broker.topicAsString(topic);
    const listener     = (event: BrokerCustomEvent<T>): void => {
      callback.call(targetExt, event.detail, event);
    };

    targetExt.addEventListener(topicStr, listener, true);

    if(targetExt.__MfBrokerRetained) {
      const lastPublish = targetExt.__MfBrokerRetained.get(topicStr);
      if(lastPublish) {
        // Defer execution
        setTimeout(() => {
          callback.call(targetExt, lastPublish.data, lastPublish.event);
        }, 0);
      }
    }

    return {
      broker: this,
      topic: topicStr,
      callback,
      unsubscribe: (): void => {
        this.target.removeEventListener(topicStr, listener, true);
      }
    };
  }

  // TODO: docs
  // TODO: test
  getRetained (topic: BrokerTopic): BrokerRetainedData {
    const targetExt = this.target as BrokerTargetExtended;
    const topicStr     = Broker.topicAsString(topic);
    const lastPublish  = targetExt.__MfBrokerRetained.get(topicStr);
    if(lastPublish) {
      return Object.assign({}, lastPublish);
    }
    return null;
  }

  // TODO: docs
  // TODO: test
  static getInstance (target: Window = window): Broker {
    const targetExt = target as BrokerTargetExtended;
    if(!targetExt.__MfBrokerInstance) {
      targetExt.__MfBrokerInstance = new Broker(target);
    }
    return targetExt.__MfBrokerInstance;
  }

  // TODO: docs
  // TODO: test
  static topicAsString (topic: BrokerTopic): string {
    if(Array.isArray(topic)) {
      topic = topic.join(":");
    }
    return topic;
  }
}

export function getBroker (): Broker {
  return Broker.getInstance();
}

export function publish<T=any> (topic: BrokerTopic, data: T, retain: boolean = false): BrokerRetainedData {
  return getBroker().publish(topic, data, retain);
}

export function publishRetained<T=any> (topic: BrokerTopic, data: T): BrokerRetainedData {
  return getBroker().publish(topic, data, true);
}
