import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Settings } from './Settings';

export function ZipkinApp() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Settings />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
