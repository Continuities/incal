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
import { useGet, ApiResolver } from '@service/api';

const ProfilePage = ():React$Node => {
  const { email } = useParams();
  const [ refresh, setRefresh ] = useState(0);
  const response = useGet(`/user/${email || ''}`, refresh);
  return (
    <Content>
      <ApiResolver 
        data={response}
        error={() => <Orphan />}
      >
        {user => <Profile 
          user={user} 
          refresh={() => setRefresh(r => r + 1)} />}
      </ApiResolver>
    </Content>
  );
};

export default ProfilePage;