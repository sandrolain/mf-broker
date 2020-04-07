
export type BrokerTopic = string | string[];
export type BrokerTopicCallback<T=any> = (data: T, event: Event) => void;
export type BrokerTarget = Window | Document | Element;

export interface BrokerSubscription {
  broker: Broker;
  topic: string;
  callback: BrokerTopicCallback;
  unsubscribe: () => void;
}

export interface BrokerCustomEventInfo {
  date: Date;
  retain: boolean;
}

export type BrokerCustomEvent<T> = CustomEvent<T> & { detailInfo?: BrokerCustomEventInfo };

const topicAsString = (topic: BrokerTopic): string => {
  if(Array.isArray(topic)) {
    topic = topic.join(":");
  }
  return topic;
};

export type BrokerRetainedData = { data: any; event: Event; info: BrokerCustomEventInfo };

type BrokerTargetRetain = BrokerTarget & { __BrokerRetained: BrokerRetainedMap };
type BrokerRetainedMap = Map<string, BrokerRetainedData>;

export class Broker {

  constructor (readonly target: BrokerTarget = window) {
    const targetRetain = this.target as BrokerTargetRetain;
    targetRetain.__BrokerRetained = new Map();
  }

  getRetained (topic: BrokerTopic): BrokerRetainedData {
    const targetRetain = this.target as BrokerTargetRetain;
    const topicStr     = topicAsString(topic);
    const lastPublish  = targetRetain.__BrokerRetained.get(topicStr);
    if(lastPublish) {
      return Object.assign({}, lastPublish);
    }
    return null;
  }

  subscribe<T=any> (topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription {
    const targetRetain = this.target as BrokerTargetRetain;
    const topicStr     = topicAsString(topic);
    const listener     = (event: BrokerCustomEvent<T>): void => {
      callback.call(targetRetain, event.detail, event);
    };

    targetRetain.addEventListener(topicStr, listener, true);

    if(targetRetain.__BrokerRetained) {
      const lastPublish = targetRetain.__BrokerRetained.get(topicStr);
      if(lastPublish) {
        callback.call(targetRetain, lastPublish.data, lastPublish.event);
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

  publish<T=any> (topic: BrokerTopic, data: T, retain: boolean = false): void {
    return this.publishWithTarget(this.target, topic, data, retain);
  }

  publishWithTarget<T=any> (target: BrokerTarget, topic: BrokerTopic, data: T, retain: boolean = false): void {
    const targetRetain = this.target as BrokerTargetRetain;
    const topicStr     = topicAsString(topic);
    const info: BrokerCustomEventInfo = {
      date: new Date(),
      retain
    };
    const event: BrokerCustomEvent<T>        = new CustomEvent(topicStr, {
      detail: data,
      bubbles: true,
      cancelable: false,
      // A Boolean indicating whether the event will trigger listeners outside of a shadow root
      composed: true
    });

    event.detailInfo = info;

    if(retain) {
      targetRetain.__BrokerRetained.set(topicStr, { data, info, event });
    }
    target.dispatchEvent(event);
  }

  static getBroker (target: BrokerTarget = window): Broker {
    return new Broker(target);
  }
}
