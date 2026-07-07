import { getApiKey } from './storage.js';
import { callModel as callModelFallback } from './openai.js';

let worker;
let callId = 0;
const pending = new Map();

export function callModelInBackground(payload) {
  if (!window.Worker) return callModelFallback(payload);
  if (!worker) {
    worker = new Worker(new URL('../workers/modelWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      const { id, result, error } = event.data;
      const callbacks = pending.get(id);
      if (!callbacks) return;
      pending.delete(id);
      if (error) callbacks.reject(new Error(error));
      else callbacks.resolve(result);
    };
  }
  const id = ++callId;
  const message = {
    ...payload,
    apiKey: getApiKey(),
    signal: undefined,
  };
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, payload: message });
  });
}
