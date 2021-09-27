import React from 'react';

const InsomniaZipkinContext = React.createContext();

function InsomniaZipkinProvider({
  store,
  requests,
  initialData,
  syncStore,
  children,
}) {
  return (
    <InsomniaZipkinContext.Provider
      value={{ store, requests, initialData, syncStore }}
    >
      {children}
    </InsomniaZipkinContext.Provider>
  );
}

function useInsomniaZipkin() {
  const context = React.useContext(InsomniaZipkinContext);
  if (context === undefined) {
    throw new Error(
      'useInsomniaZipkin must be used within a InsomniaZipkinProvider',
    );
  }

  return context;
}

export { InsomniaZipkinProvider, useInsomniaZipkin };
