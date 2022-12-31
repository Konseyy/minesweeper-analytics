import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Receiver from './Receiver';
import Sender from './Sender';

const MultiplayerContainer = () => {
  const [queryParams] = useSearchParams();
  const otherId = queryParams.get('id');

  return <div>{otherId ? <Sender otherId={otherId} /> : <Receiver />}</div>;
};

export default MultiplayerContainer;
