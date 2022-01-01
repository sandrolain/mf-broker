export declare type BrokerTopic = string | string[];
export declare type BrokerTopicCallback<T = any> = (data: T, event: BrokerCustomEvent<T>) => void;
export declare type BrokerTarget = Window | Document | HTMLElement;
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
export declare type BrokerCustomEvent<T> = CustomEvent<T> & {
    detailInfo?: BrokerCustomEventInfo;
};
export interface BrokerRetainedData {
    info: BrokerCustomEventInfo;
    data: any;
    event: Event;
}
export interface BrokerInterface {
    getTarget(): Window;
    getTargetId(): string;
    publish<T = any>(topic: BrokerTopic, data: T, retain: boolean): BrokerRetainedData;
    subscribe<T = any>(topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription;
    getRetained(topic: BrokerTopic): BrokerRetainedData;
}
export declare class Broker implements BrokerInterface {
    readonly target: Window;
    constructor(target?: Window);
    getTarget(): Window;
    getTargetId(): string;
    publish<T = any>(topic: BrokerTopic, data: T, retain?: boolean): BrokerRetainedData;
    publishWithTarget<T = any>(target: BrokerTarget, topic: BrokerTopic, data: T, retain?: boolean): BrokerRetainedData;
    publishCustom<T = any>(target: BrokerTarget, topic: BrokerTopic, info: BrokerCustomEventInfo, data: T): BrokerRetainedData;
    subscribe<T = any>(topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription;
    getRetained(topic: BrokerTopic): BrokerRetainedData;
    static getInstance(target?: Window): Broker;
    static topicAsString(topic: BrokerTopic): string;
}
