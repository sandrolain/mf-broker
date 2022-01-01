import { Broker } from "./Broker";
import { FramesetBroker } from "./FramesetBroker";
import { ProcedureBroker } from "./ProcedureBroker";

export * from "./Broker";
export * from "./FramesetBroker";
export * from "./ProcedureBroker";

export function getBroker (): Broker {
  return Broker.getInstance();
}

export function getFramesetBroker (): FramesetBroker {
  return FramesetBroker.getInstance(Broker.getInstance());
}

export function getProcedureBroker (): ProcedureBroker {
  return ProcedureBroker.getInstance(Broker.getInstance());
}

export function getFramesetProcedureBroker (): ProcedureBroker {
  return ProcedureBroker.getInstance(FramesetBroker.getInstance(Broker.getInstance()));
}
