import { PLUGIN_NAME, TRACE_ID_LENGTH } from './constants';
import { generateRandomHexString } from './lib/generateRandomHexString';
import { ZipkinState } from './lib/ZipkinState';

export async function setHeaders({ store, request }) {
  const requestId = request.getId();
  const zipkinRequest = new ZipkinState(store, requestId);
  const data = await zipkinRequest.getData();

  if (!data.isEnabled) {
    console.log(`[${PLUGIN_NAME}]: Disabled, skipping...`);
    return false;
  }

  request.setHeader('X-B3-Flags', 1);
  console.log(`[${PLUGIN_NAME}]: Enabled tracing...`);

  if (data.generateTraceId) {
    const traceId = generateRandomHexString(TRACE_ID_LENGTH);

    request.setHeader('X-B3-SpanId', traceId);
    request.setHeader('X-B3-TraceId', traceId);
  }
}
