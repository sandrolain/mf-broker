import { BrokerInterface, Broker, BrokerSubscription } from "./Broker";
import { FramesetBroker } from "./FramesetBroker";
import { v4 as uuidv4 } from "uuid";

// TODO: docs
export type ProcedureCallback<T=any> = (...args: any[]) => T;

interface ProcedureBrokerTargetExtension {
  __MfBrokerTargetId: string;
  __MfProcedureBrokerInstance: ProcedureBroker;
  __MfProcedureBrokerHasListener: boolean;
}

type ProcedureBrokerTargetExtended = Window & ProcedureBrokerTargetExtension;

// TODO: docs
interface ProcedureRequest {
  id: string;
  name: string;
  args: any[];
  resolved: boolean;
}

// TODO: docs
interface ProcedureResponse<T=any> {
  id: string;
  name: string;
  result: T;
}


const PROCEDURE_REQUEST_TOPIC  = "mf:proc:req";
const PROCEDURE_RESPONSE_TOPIC = "mf:proc:res";

// TODO: docs
// TODO: test
export class ProcedureBroker {
  static readonly DEFAULT_TIMEOUT = 1000;

  private targetWindow: Window;
  private registeredCallbacks: Map<string, ProcedureCallback> = new Map();
  private subscription: BrokerSubscription;

  constructor (
    private broker: BrokerInterface,
    private responseTimeout: number = 5000
  ) {
    this.targetWindow = broker.getTarget();
    this.getTargetId();
    this.initProcedureRequestListener();
  }

  // TODO: docs
  // TODO: test
  setReponseTimeout (responseTimeout: number): void {
    this.responseTimeout = responseTimeout;
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
  register (name: string, callback: ProcedureCallback): void  {
    this.registeredCallbacks.set(name, callback);
  }

  // TODO: docs
  // TODO: test
  getCallback (name: string): ProcedureCallback {
    return this.registeredCallbacks.get(name);
  }

  // TODO: docs
  // TODO: test
  call<T=any> (name: string, ...args: any[]): Promise<T> {
    const request: ProcedureRequest = {
      id: uuidv4(),
      name,
      args,
      resolved: false
    };

    // Check immediately if there is a callback in this scope so as to avoid generating events
    const callback = this.getCallback(request.name);
    if(callback) {
      return this.applyCallback<T>(request, callback);
    }

    return new Promise((resolve, reject) => {
      let tou: number = null;
      const subscription = this.broker.subscribe(`${PROCEDURE_RESPONSE_TOPIC}:${request.id}`, (response: ProcedureResponse<T>) => {
        subscription.unsubscribe();
        window.clearTimeout(tou);
        resolve(response.result);
      });
      tou = window.setTimeout(() => {
        subscription.unsubscribe();
        reject(new Error(`Procedure request timeout (${this.responseTimeout}) for callback with name "${name}"`));
      }, this.responseTimeout);
      this.broker.publish(PROCEDURE_REQUEST_TOPIC, request, false);
    });
  }

  private initProcedureRequestListener (): void {
    const targetExt   = this.targetWindow as ProcedureBrokerTargetExtended;
    if(!targetExt.__MfProcedureBrokerHasListener) {
      this.subscription = this.broker.subscribe(PROCEDURE_REQUEST_TOPIC, async (request: ProcedureRequest) => {
        const callback = this.getCallback(request.name);
        if(callback) {
          const result = await this.applyCallback(request, callback);
          const response: ProcedureResponse = {
            id: request.id,
            name: request.name,
            result
          };
          this.broker.publish(`${PROCEDURE_RESPONSE_TOPIC}:${request.id}`, response, false);
        }
      });
      targetExt.__MfProcedureBrokerHasListener = true;
    }
  }

  private async applyCallback<T> (request: ProcedureRequest, callback: ProcedureCallback<T>): Promise<T> {
    let result = callback(...request.args);
    request.resolved = true;
    if(result instanceof Promise) {
      result = await result;
    }
    return result;
  }

  // TODO: docs
  // TODO: test
  static getInstance (broker: BrokerInterface): ProcedureBroker {
    const targetExt = broker.getTarget() as ProcedureBrokerTargetExtended;
    if(!targetExt.__MfProcedureBrokerInstance) {
      targetExt.__MfProcedureBrokerInstance = new ProcedureBroker(broker, ProcedureBroker.DEFAULT_TIMEOUT);
    }
    return targetExt.__MfProcedureBrokerInstance;
  }
}

export function getProcedureBroker (): ProcedureBroker {
  return ProcedureBroker.getInstance(Broker.getInstance());
}

export function getFramesetProcedureBroker (): ProcedureBroker {
  return ProcedureBroker.getInstance(FramesetBroker.getInstance(Broker.getInstance()));
}
