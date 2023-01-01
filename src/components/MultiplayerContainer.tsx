import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Receiver from './Receiver';
import Sender from './Sender';

const MultiplayerContainer = () => {
  const [queryParams] = useSearchParams();
  const otherId = queryParams.get('id');
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

  return (
    <div>{isChrome ? <div>{otherId ? <Sender otherId={otherId} /> : <Receiver />}</div> : <div>Multiplayer only works on Chrome</div>}</div>
  );
};

export default MultiplayerContainer;
