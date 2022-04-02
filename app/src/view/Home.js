/**
 * Your profile
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import Content from '@view/Content';
import Profile from '@view/Profile';
import Orphan from '@view/Orphan';
import { api, auth } from '@authweb/service';

const Home = ():React$Node => {
  const [ response, refresh ] = auth.useCurrentUser();
  return (
    <Content>
    <api.ApiResolver 
      data={response}
      error={() => <Orphan />}
    >
      {user => <Profile user={user} refresh={refresh} />}
    </api.ApiResolver>
    </Content>
  );
};

export default Home;