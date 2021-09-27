import React from 'react';
import { useInsomniaZipkin } from '../context/insomniaZipkinContext';
import { RequestSettings } from './RequestSettings';
import { ListGroup } from 'insomnia-components';
import { RequestData } from './RequestData';

export function Requests() {
  const { requests } = useInsomniaZipkin();

  return (
    <div className="pad">
      <ListGroup>
        {requests.map((request) => (
          <React.Fragment key={request._id}>
            <RequestData request={request} />
            <RequestSettings request={request} />
          </React.Fragment>
        ))}
      </ListGroup>
    </div>
  );
}
