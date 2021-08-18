import React from 'react';
import ReactDOM from 'react-dom';
import {
  useQuery,
  QueryClientProvider,
  QueryClient,
  useQueryClient,
  useMutation,
} from 'react-query';
import { ToggleSwitch } from 'insomnia-components';
// const { clipboard } = require('electron');
import { ReactQueryDevtools } from 'react-query/devtools';

function genRandHex(length) {
  return [...Array(length)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

const PLUGIN_NAME = 'zipkin';
const TRACE_ENABLED_KEY_PREFIX = 'trace';
const TRACE_ID_KEY_PREFIX = 'traceId';
const TRACE_ID_LENGTH = 16;

async function setHeaders(context) {
  const requestId = context.request.getId();
  const includeTrace = await context.store.hasItem(
    `${TRACE_ENABLED_KEY_PREFIX}.${requestId}`,
  );

  if (!includeTrace) {
    console.log(`[${PLUGIN_NAME}]: Disabled, skipping...`);
    const test = await context.store.getItem(
      `${TRACE_ENABLED_KEY_PREFIX}.${requestId}`,
    );
    return false;
  }

  const traceId = genRandHex(TRACE_ID_LENGTH);
  context.request.setHeader('X-B3-Flags', 1);
  context.request.setHeader('X-B3-SpanId', traceId);
  context.request.setHeader('X-B3-TraceId', traceId);
  // clipboard.writeText(traceId);

  context.store.setItem(`${TRACE_ID_KEY_PREFIX}.${requestId}`, `${traceId}`),
    console.log(`[${PLUGIN_NAME}]: Set trace headers - TraceId: ${traceId}`);
}

function ZipkinApp(props) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Settings {...props} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

const baseSettings = {
  enabled: false,
  generateTraceId: false,
};

function Settings({ store, request, initialTraceEnabled }) {
  const queryClient = useQueryClient();
  const traceEnabledId = `${TRACE_ENABLED_KEY_PREFIX}.${request._id}`;

  const traceEnabledQuery = useQuery(
    traceEnabledId,
    async () => store.hasItem(traceEnabledId),
    {
      initialData: initialTraceEnabled,
    },
  );

  const enableTraceMutation = useMutation(
    () => store.setItem(traceEnabledId, 'true'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(traceEnabledId);
      },
    },
  );

  const disableTraceMutation = useMutation(
    () => store.removeItem(traceEnabledId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(traceEnabledId);
      },
    },
  );

  function handleTraceToggleChange(value, e) {
    if (value === true) {
      enableTraceMutation.mutate();
    } else if (value === false) {
      disableTraceMutation.mutate();
    }
  }

  return (
    <div className="pad">
      <label className="row-spaced">
        <span className="strong">Enable zipkin tracing</span>
        <ToggleSwitch
          checked={traceEnabledQuery.data}
          onChange={handleTraceToggleChange}
        />
      </label>
    </div>
  );
}

const zipkinRequestAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const initialTraceEnabled = await context.store.hasItem(
      `${TRACE_ENABLED_KEY_PREFIX}.${data.request._id}`,
    );

    const root = document.createElement('div');
    ReactDOM.render(
      <ZipkinApp
        store={context.store}
        request={data.request}
        initialTraceEnabled={initialTraceEnabled}
      />,
      root,
    );

    context.app.dialog(
      `Zipkin - ${data.request.method} ${data.request.name}!`,
      root,
      {
        skinny: true,
        onHide: () => ReactDOM.unmountComponentAtNode(root),
      },
    );
  },
};

exports.requestActions = [zipkinRequestAction];
exports.requestHooks = [setHeaders];
