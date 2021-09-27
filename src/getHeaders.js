import { PLUGIN_NAME } from './constants';
import { ZipkinState } from './lib/ZipkinState';

export async function getHeaders({ store, response }) {
  const requestId = response.getRequestId();
  const zipkinState = new ZipkinState(store, requestId);
  const data = await zipkinState.getData();

  if (!data.isEnabled) {
    console.log(`[${PLUGIN_NAME}]: Disabled, skipping...`);
    return false;
  }

  const traceHeaderKey = data.traceIdHeaderKey;
  const traceId = response.getHeader(traceHeaderKey);

  await zipkinState.setLastTraceId(traceId);
  console.log(`[${PLUGIN_NAME}]: Set last trace id - TraceId: ${traceId}`);
}
