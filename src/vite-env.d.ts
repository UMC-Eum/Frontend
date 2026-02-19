/// <reference types="vite/client" />
declare module "mic-recorder-to-mp3" {
  class MicRecorder {
    constructor(config?: { bitRate?: number });
    start(): Promise<void>;
    stop(): MicRecorder;
    getMp3(): Promise<[Int8Array[], Blob]>;
  }
  export default MicRecorder;
}
