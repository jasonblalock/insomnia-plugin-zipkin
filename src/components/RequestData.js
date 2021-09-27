import React from 'react';
import { useQuery } from 'react-query';
import { useInsomniaZipkin } from '../context/insomniaZipkinContext';
import { ZipkinState } from '../lib/ZipkinState';
import styled from 'styled-components';

const StyledSelectable = styled.span`
  user-select: text;
`;

export function RequestData({ request }) {
  const { store, initialData } = useInsomniaZipkin();
  const requestId = request._id;
  const zipkinState = new ZipkinState(store, requestId);

  const dataQuery = useQuery(
    requestId,
    async () => await zipkinState.getData(),
    {
      initialData: initialData[requestId],
    },
  );

  return (
    <div className="margin-top margin-left">
      Last trace id:{' '}
      <StyledSelectable>
        {dataQuery.data.lastTraceId || '<none>'}
      </StyledSelectable>
    </div>
  );
}
