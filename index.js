import React from 'react';
import ReactDOM from 'react-dom';
import { InsomniaZipkinProvider } from './src/context/insomniaZipkinContext';
import { setHeaders } from './src/setHeaders';
import { ZipkinApp } from './src/components/ZipkinApp';
import { ZipkinRequest } from './src/lib/ZipkinRequest';

async function buildInitialData(store, requests) {
  const initialData = {};

  for (const request of requests) {
    const zipkinRequest = new ZipkinRequest(store, request._id);
    const data = await zipkinRequest.getData();
    initialData[request._id] = data;
  }
  return initialData;
}

async function renderZipkinApp(store, requests) {
  const initialData = await buildInitialData(store, requests);
  const root = document.createElement('div');

  ReactDOM.render(
    <InsomniaZipkinProvider {...{ store, requests, initialData }}>
      <ZipkinApp />
    </InsomniaZipkinProvider>,
    root,
  );

  return root;
}

const zipkinRequestAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const root = await renderZipkinApp(context.store, [data.request]);

    context.app.dialog(`Zipkin`, root, {
      onHide: () => ReactDOM.unmountComponentAtNode(root),
    });
  },
};

const zipkinGroupAction = {
  label: 'Zipkin',
  action: async (context, data) => {
    const { requests } = data;

    const root = await renderZipkinApp(context.store, requests);

    context.app.dialog(`Zipkin`, root, {
      onHide: () => ReactDOM.unmountComponentAtNode(root),
    });
  },
};

exports.requestActions = [zipkinRequestAction];
exports.requestHooks = [setHeaders];
exports.requestGroupActions = [zipkinGroupAction];
