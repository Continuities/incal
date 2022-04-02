/**
 * View profile by email param
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Content from '@view/Content';
import Profile from '@view/Profile';
import Orphan from '@view/Orphan';
import { api } from '@authweb/service';

const ProfilePage = ():React$Node => {
  const { email } = useParams();
  const [ refresh, setRefresh ] = useState(0);
  const response = api.useGet(`/user/${email || ''}`, refresh);
  return (
    <Content>
      <api.ApiResolver 
        data={response}
        error={({ code, description }) => 
          code === 401 ? <Orphan /> : description}
      >
        {user => <Profile 
          user={user} 
          refresh={() => setRefresh(r => r + 1)} />}
      </api.ApiResolver>
    </Content>
  );
};

export default ProfilePage;