import React from 'react';
import ReactDOM from 'react-dom';
import { InsomniaZipkinProvider } from './src/context/insomniaZipkinContext';
import { setHeaders } from './src/setHeaders';
import { ZipkinApp } from './src/components/ZipkinApp';
import { ZipkinState } from './src/lib/ZipkinState';
import { getHeaders } from './src/getHeaders';

const syncStore = {};

async function buildInitialData(store, requests) {
  const initialData = {};

  for (const request of requests) {
    const zipkinState = new ZipkinState(store, request._id);
    const data = await zipkinState.getData();
    syncStore[request._id] = {
      traceIdHeaderKey: data.traceIdHeaderKey || 'X-B3-TraceId',
    };
    initialData[request._id] = data;
  }
  return initialData;
}

async function renderZipkinApp(store, requests) {
  const initialData = await buildInitialData(store, requests);
  const root = document.createElement('div');

  ReactDOM.render(
    <InsomniaZipkinProvider {...{ store, requests, initialData, syncStore }}>
      <ZipkinApp />
    </InsomniaZipkinProvider>,
    root,
  );

  return root;
}

async function updateStoreBeforeClose(store, requests) {
  for (const request of requests) {
    const zipkinState = new ZipkinState(store, request._id);
    await zipkinState.setTraceIdHeaderKey(
      syncStore[request._id].traceIdHeaderKey,
    );
  }
}

const zipkinRequestAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const root = await renderZipkinApp(context.store, [data.request]);

    context.app.dialog(`Zipkin`, root, {
      onHide: async () => {
        await updateStoreBeforeClose(context.store, [data.request]);
        ReactDOM.unmountComponentAtNode(root);
      },
    });
  },
};

const zipkinGroupAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const { requests } = data;

    const root = await renderZipkinApp(context.store, requests);

    context.app.dialog(`Zipkin`, root, {
      onHide: async () => {
        await updateStoreBeforeClose(context.store, requests);
        ReactDOM.unmountComponentAtNode(root);
      },
    });
  },
};

exports.requestActions = [zipkinRequestAction];
exports.requestHooks = [setHeaders];
exports.responseHooks = [getHeaders];
exports.requestGroupActions = [zipkinGroupAction];
