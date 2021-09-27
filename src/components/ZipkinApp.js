import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Requests } from './Requests';

export function ZipkinApp() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Requests />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
