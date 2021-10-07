/**
 * View profile by email param
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import { useParams } from 'react-router-dom';
import Content from '@view/Content';
import Profile from '@view/Profile';
import { useGet, ApiResolver } from '@service/api';

const Home = ():React$Node => {
  const { email } = useParams();
  const response = useGet(`/user/${email || ''}`);
  return (
    <Content>
      <ApiResolver data={response}>
        {user => <Profile user={user} />}
      </ApiResolver>
    </Content>
  );
};

export default Home;