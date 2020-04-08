import { BrokerCustomEventInfo, BrokerTopic, Broker, BrokerTargetExtended, BrokerRetainedData, BrokerTopicCallback, BrokerSubscription } from "./Broker";
import { uuidv4 } from "./tools";

export interface FramesetBrokerMessage {
  senderId: string;
  id: string;
  topic: string;
  info: BrokerCustomEventInfo;
  data: any;
}

export class FramesetBroker {
  private broker: Broker;

  // TODO: manage target ad DOM nodes to propagate only to childs
  constructor (
    readonly targetWindow: Window = window,
    readonly acceptedOrigins: string[] = null
  ) {
    if(!this.acceptedOrigins) {
      this.acceptedOrigins = [this.targetWindow.location.origin];
    }

    this.getCurrentTargetId();
    this.initEventPropagationListener();
    this.broker = new Broker(this.targetWindow);
  }

  private getCurrentTargetId (): string {
    const targetExt = this.targetWindow as BrokerTargetExtended;
    if(!targetExt.__BrokerTargetId) {
      targetExt.__BrokerTargetId = `T-${uuidv4()}`;
    }
    return targetExt.__BrokerTargetId;
  }

  private initEventPropagationListener (): void {
    this.targetWindow.addEventListener("message", (event: MessageEvent) => {
      if(this.acceptedOrigins.includes(event.origin)) {
        const message = event.data;
        if(this.isFramesetBrokerMessage(message) && !this.isSentFromCurrentTarget(message)) {
          this.propagateIntoCurrentTarget(message);
          this.propagateToChildsTargets(message, event.origin);
        }
      }
    });
  }

  private isFramesetBrokerMessage (message: any): boolean {
    return (message.senderId && message.id && message.info && message.data);
  }

  private isSentFromCurrentTarget (message: FramesetBrokerMessage): boolean {
    const currentId = this.getCurrentTargetId();
    return (message.senderId === currentId);
  }

  publish<T=any> (topic: BrokerTopic, data: T, retain: boolean = false): void {
    const topicStr    = Broker.topicAsString(topic);
    const messageData = this.broker.publish<T>(topicStr, data, retain);
    const targetExt   = this.targetWindow as BrokerTargetExtended;
    this.requestEventPropagation({
      senderId: targetExt.__BrokerTargetId,
      id: `M-${uuidv4()}`,
      topic: topicStr,
      info: messageData.info,
      data: messageData.data
    });
  }

  private requestEventPropagation (message: FramesetBrokerMessage, targetOrigin: string = this.targetWindow.location.origin): void {
    const topWindow = this.targetWindow.top;
    if(topWindow && topWindow !== this.targetWindow) {
      topWindow.postMessage(message, targetOrigin);
    }
    this.propagateToChildsTargets(message, targetOrigin);
  }

  private getChildsTargets (): Window[] {
    const frames = [
      ...Array.from(this.targetWindow.document.querySelectorAll("frame")),
      ...Array.from(this.targetWindow.document.querySelectorAll("iframe"))
    ];
    const result: Window[] = [];
    for(const frameNode of frames) {
      if(frameNode.contentWindow) {
        result.push(frameNode.contentWindow);
      }
    }
    return result;
  }

  private propagateIntoCurrentTarget (message: FramesetBrokerMessage): void {
    this.broker.publishCustom(this.targetWindow, message.topic, message.info, message.data);
  }

  private propagateToChildsTargets (message: FramesetBrokerMessage, targetOrigin: string): void {
    const targets = this.getChildsTargets();
    targets.forEach((target: Window) => {
      target.postMessage(message, targetOrigin);
    });
  }

  subscribe<T=any> (topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription {
    return this.broker.subscribe<T> (topic, callback);
  }

  getRetained (topic: BrokerTopic): BrokerRetainedData {
    return this.broker.getRetained(topic);
  }

  static getBroker (target: Window = window): FramesetBroker {
    return new FramesetBroker(target);
  }

}
