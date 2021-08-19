import React, { useContext } from 'react';
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

const InsomniaContext = React.createContext({});

function ZipkinApp(props) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Settings />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function Settings(props) {
  const { requests } = useContext(InsomniaContext);

  return (
    <div className="pad">
      <h4 className="margin-bottom-xs underline">Enable zipkin tracing</h4>
      <div className="pad-left">
        {requests.map((request) => (
          <SettingItem key={request._id} request={request} />
        ))}
      </div>
    </div>
  );
}

function SettingItem({ request }) {
  const { store, initialTracesEnabled } = useContext(InsomniaContext);
  const queryClient = useQueryClient();
  const traceEnabledId = `${TRACE_ENABLED_KEY_PREFIX}.${request._id}`;

  const traceEnabledQuery = useQuery(
    traceEnabledId,
    async () => store.hasItem(traceEnabledId),
    {
      initialData: initialTracesEnabled[traceEnabledId],
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
    <div className="margin-bottom-xs">
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
  );
}

async function renderReact(store, requests) {
  const root = document.createElement('div');

  const initialTracesEnabled = await buildInitialTracesEnabled(store, requests);

  ReactDOM.render(
    <InsomniaContext.Provider value={{ store, requests, initialTracesEnabled }}>
      <ZipkinApp />
    </InsomniaContext.Provider>,

    root,
  );

  return root;
}

async function buildInitialTracesEnabled(store, requests) {
  const initialTracesEnabled = {};
  for (const request of requests) {
    const traceEnabledId = `${TRACE_ENABLED_KEY_PREFIX}.${request._id}`;
    const traceEnabled = await store.hasItem(traceEnabledId);
    initialTracesEnabled[traceEnabledId] = traceEnabled;
  }
  return initialTracesEnabled;
}

const zipkinRequestAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const root = await renderReact(context.store, [data.request]);

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

    const root = await renderReact(context.store, requests);

    context.app.dialog(`Zipkin`, root, {
      skinny: true,
      onHide: () => ReactDOM.unmountComponentAtNode(root),
    });
  },
};

exports.requestActions = [zipkinRequestAction];
exports.requestHooks = [setHeaders];
exports.requestGroupActions = [zipkinGroupAction];
