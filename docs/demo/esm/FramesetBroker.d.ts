import { BrokerCustomEventInfo, BrokerTopic, Broker, BrokerRetainedData, BrokerTopicCallback, BrokerSubscription, BrokerInterface } from "./Broker";
export interface FramesetBrokerMessage {
    senderId: string;
    id: string;
    topic: string;
    info: BrokerCustomEventInfo;
    data: any;
}
export declare class FramesetBroker implements BrokerInterface {
    private broker;
    readonly acceptedOrigins: string[];
    private targetWindow;
    constructor(broker: Broker, acceptedOrigins?: string[]);
    getTarget(): Window;
    getTargetId(): string;
    publish<T = any>(topic: BrokerTopic, data: T, retain?: boolean): BrokerRetainedData;
    subscribe<T = any>(topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription;
    getRetained(topic: BrokerTopic): BrokerRetainedData;
    private initEventPropagationListener;
    private isFramesetBrokerMessage;
    private isSentFromCurrentTarget;
    private requestEventPropagation;
    private getChildsTargets;
    private propagateIntoCurrentTarget;
    private propagateToChildsTargets;
    static getInstance(broker: Broker): FramesetBroker;
}
