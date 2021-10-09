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
import { ApiResolver } from '@service/api';
import { useCurrentUser } from "@service/auth";

const Home = ():React$Node => {
  const [ response, refresh ] = useCurrentUser();
  return (
    <Content>
    <ApiResolver 
      data={response}
      error={() => <Orphan />}
    >
      {user => <Profile user={user} refresh={refresh} />}
    </ApiResolver>
    </Content>
  );
};

export default Home;