import { uuidv4 } from "./tools";

export type BrokerTopic = string | string[];
export type BrokerTopicCallback<T=any> = (data: T, event: Event) => void;
export type BrokerTarget = Window | Document | HTMLElement;

export interface BrokerSubscription {
  broker: Broker;
  topic: string;
  callback: BrokerTopicCallback;
  unsubscribe: () => void;
}

export interface BrokerCustomEventInfo {
  date: Date;
  retain: boolean;
  id: string;
}

export type BrokerCustomEvent<T> = CustomEvent<T> & { detailInfo?: BrokerCustomEventInfo };

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

export class Broker implements BrokerInterface {

  constructor (readonly target: Window = window) {
    const targetExt = this.target as BrokerTargetExtended;
    targetExt.__MfBrokerRetained = new Map();
  }

  getTarget (): Window {
    return this.target;
  }

  getTargetId (): string {
    const targetExt = this.target as BrokerTargetExtended;
    if(!targetExt.__MfBrokerTargetId) {
      targetExt.__MfBrokerTargetId = `T-${uuidv4()}`;
    }
    return targetExt.__MfBrokerTargetId;
  }

  publish<T=any> (topic: BrokerTopic, data: T, retain: boolean = false): BrokerRetainedData {
    return this.publishWithTarget<T>(this.target, topic, data, retain);
  }

  publishWithTarget<T=any> (target: BrokerTarget, topic: BrokerTopic, data: T, retain: boolean = false): BrokerRetainedData {
    const info: BrokerCustomEventInfo = {
      date: new Date(),
      retain,
      id: `E-${uuidv4()}`
    };
    return this.publishCustom(target, topic, info, data);
  }

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
        callback.call(targetExt, lastPublish.data, lastPublish.event);
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



  getRetained (topic: BrokerTopic): BrokerRetainedData {
    const targetExt = this.target as BrokerTargetExtended;
    const topicStr     = Broker.topicAsString(topic);
    const lastPublish  = targetExt.__MfBrokerRetained.get(topicStr);
    if(lastPublish) {
      return Object.assign({}, lastPublish);
    }
    return null;
  }

  static getInstance (target: Window = window): Broker {
    const targetExt = target as BrokerTargetExtended;
    if(!targetExt.__MfBrokerInstance) {
      targetExt.__MfBrokerInstance = new Broker(target);
    }
    return targetExt.__MfBrokerInstance;
  }

  static topicAsString (topic: BrokerTopic): string {
    if(Array.isArray(topic)) {
      topic = topic.join(":");
    }
    return topic;
  }
}
