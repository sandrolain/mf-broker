import { v4 as uuidv4 } from "uuid";
import { BrokerCustomEventInfo, BrokerTopic, Broker, BrokerRetainedData, BrokerTopicCallback, BrokerSubscription, BrokerInterface } from "./Broker";

interface FramesetBrokerTargetExtension {
  __MfBrokerTargetId: string;
  __MfFramesetBrokerInstance: FramesetBroker;
  __MfFramesetBrokerHasListener: boolean;
}

type FramesetBrokerTargetExtended = Window & FramesetBrokerTargetExtension;

export interface FramesetBrokerMessage {
  senderId: string;
  id: string;
  topic: string;
  info: BrokerCustomEventInfo;
  data: any;
}

// TODO: docs
// TODO: test
export class FramesetBroker implements BrokerInterface {
  private targetWindow: Window;

  constructor (
    private broker: Broker,
    readonly acceptedOrigins: string[] = null
  ) {
    this.targetWindow = broker.getTarget();

    if(!this.acceptedOrigins) {
      this.acceptedOrigins = [broker.getTarget().location.origin];
    }

    this.getTargetId();
    this.initEventPropagationListener();
  }

  // TODO: docs
  // TODO: test
  getTarget (): Window {
    return this.targetWindow;
  }

  // TODO: docs
  // TODO: test
  getTargetId (): string {
    return this.broker.getTargetId();
  }

  // TODO: docs
  // TODO: test
  publish<T=any> (topic: BrokerTopic, data: T, retain: boolean = false): BrokerRetainedData {
    const topicStr    = Broker.topicAsString(topic);
    const messageData = this.broker.publish<T>(topicStr, data, retain);
    const targetExt   = this.targetWindow as FramesetBrokerTargetExtended;
    this.requestEventPropagation({
      senderId: targetExt.__MfBrokerTargetId,
      id: `M-${uuidv4()}`,
      topic: topicStr,
      info: messageData.info,
      data: messageData.data
    });
    return messageData;
  }

  // TODO: docs
  // TODO: test
  subscribe<T=any> (topic: BrokerTopic, callback: BrokerTopicCallback<T>): BrokerSubscription {
    return this.broker.subscribe<T> (topic, callback);
  }

  // TODO: docs
  // TODO: test
  getRetained (topic: BrokerTopic): BrokerRetainedData {
    return this.broker.getRetained(topic);
  }

  private initEventPropagationListener (): void {
    const targetExt   = this.targetWindow as FramesetBrokerTargetExtended;
    if(!targetExt.__MfFramesetBrokerHasListener) {
      targetExt.addEventListener("message", (event: MessageEvent) => {
        if(this.acceptedOrigins.includes(event.origin)) {
          const message = event.data;
          if(this.isFramesetBrokerMessage(message) && !this.isSentFromCurrentTarget(message)) {
            this.propagateIntoCurrentTarget(message);
            this.propagateToChildsTargets(message, event.origin);
          }
        }
      });
      targetExt.__MfFramesetBrokerHasListener = true;
    }
  }

  private isFramesetBrokerMessage (message: any): boolean {
    return (message.senderId && message.id && message.info && message.data);
  }

  private isSentFromCurrentTarget (message: FramesetBrokerMessage): boolean {
    const currentId = this.getTargetId();
    return (message.senderId === currentId);
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

  static getInstance (broker: Broker): FramesetBroker {
    const targetExt = broker.getTarget() as FramesetBrokerTargetExtended;
    if(!targetExt.__MfFramesetBrokerInstance) {
      targetExt.__MfFramesetBrokerInstance = new FramesetBroker(broker);
    }
    return targetExt.__MfFramesetBrokerInstance;
  }
}
