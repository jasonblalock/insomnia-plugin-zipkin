import React from 'react';
import { useInsomniaZipkin } from '../context/insomniaZipkinContext';
import { SettingRequestGroup } from './SettingRequestGroup';
import { ListGroup } from 'insomnia-components';

export function Settings() {
  const { requests } = useInsomniaZipkin();

  return (
    <div className="pad">
      <ListGroup>
        {requests.map((request) => (
          <SettingRequestGroup key={request._id} request={request} />
        ))}
      </ListGroup>
    </div>
  );
}
