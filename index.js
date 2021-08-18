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
  const { requests } = props;
  return (
    <QueryClientProvider client={queryClient}>
      {requests.map((request) => (
        <Settings
          store={props.store}
          request={request}
          initialTraceEnabled={props.initialTraceEnabled}
          key={request._id}
        />
      ))}
      {/* <Settings {...props} /> */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function Settings({ store, request, initialTraceEnabled }) {
  const queryClient = useQueryClient();
  const traceEnabledId = `${TRACE_ENABLED_KEY_PREFIX}.${request._id}`;

  const traceEnabledQuery = useQuery(
    traceEnabledId,
    async () => store.hasItem(traceEnabledId),
    {
      initialData: initialTraceEnabled[traceEnabledId],
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
      {/* <h4 className="margin-bottom-xs underline">Enable zipkin tracing</h4> */}
      <div className="pad-left">
        <label className="row-spaced">
          <span className="strong">
            {request.method} {request.name}
          </span>
          <ToggleSwitch
            checked={traceEnabledQuery.data}
            onChange={handleTraceToggleChange}
          />
        </label>
      </div>
    </div>
  );
}

const zipkinRequestAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const traceEnabledId = `${TRACE_ENABLED_KEY_PREFIX}.${data.request._id}`;
    const initialTraceEnabled = await context.store.hasItem(traceEnabledId);

    const root = document.createElement('div');
    ReactDOM.render(
      <ZipkinApp
        store={context.store}
        requests={[data.request]}
        initialTraceEnabled={{
          [traceEnabledId]: initialTraceEnabled,
        }}
      />,
      root,
    );

    context.app.dialog(
      `Zipkin - ${data.request.method} ${data.request.name}`,
      root,
      {
        skinny: true,
        onHide: () => ReactDOM.unmountComponentAtNode(root),
      },
    );
  },
};

const zipkinGroupAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const { requests } = data;
    const initialTraceEnabled = {};
    for (const request of requests) {
      const traceEnabledId = `${TRACE_ENABLED_KEY_PREFIX}.${request._id}`;
      const traceEnabled = await context.store.hasItem(traceEnabledId);
      initialTraceEnabled[traceEnabledId] = traceEnabled;
    }

    const root = document.createElement('div');
    ReactDOM.render(
      <ZipkinApp
        store={context.store}
        requests={requests}
        initialTraceEnabled={initialTraceEnabled}
      />,
      root,
    );

    context.app.dialog(`Zipkin`, root, {
      skinny: true,
      onHide: () => ReactDOM.unmountComponentAtNode(root),
    });
  },
};

exports.requestActions = [zipkinRequestAction];
exports.requestHooks = [setHeaders];
exports.requestGroupActions = [zipkinGroupAction];
