import { BrokerInterface, Broker } from "./Broker";
export declare type ProcedureCallback<T = any> = (...args: any[]) => T;
export declare class ProcedureBroker {
    private broker;
    private responseTimeout;
    private targetWindow;
    private registeredCallbacks;
    private subscription;
    constructor(broker: BrokerInterface, responseTimeout?: number);
    setReponseTimeout(responseTimeout: number): void;
    getTarget(): Window;
    getTargetId(): string;
    register(name: string, callback: ProcedureCallback): void;
    getCallback(name: string): ProcedureCallback;
    call<T = any>(name: string, ...args: any[]): Promise<T>;
    private initProcedureRequestListener;
    private applyCallback;
    static getInstance(broker: Broker, responseTimeout: number): ProcedureBroker;
}
