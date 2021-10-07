/**
 * Your profile
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import Content from '@view/Content';
import Profile from '@view/Profile';
import { ApiResolver } from '@service/api';
import { useCurrentUser } from "@service/auth";

const Home = ():React$Node => {
  const response = useCurrentUser();
  return (
    <Content>
    <ApiResolver data={response}>
      {user => <Profile user={user} />}
    </ApiResolver>
    </Content>
  );
};

export default Home;