/**
 * Directory page
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React, { useState } from 'react';
import {
  Box,
  Container
} from '@mui/material';
import { api, auth } from '@authweb/service';
import UserList from '@view/UserList';
import Content from '@view/Content';
import Orphan from '@view/Orphan';
import InviteButton from '@view/InviteButton';

const Directory = ():React$Node => {
  const [ user, refreshUser ] = auth.useCurrentUser();
  const [ resend, setResend ] = useState(0);
  const response = api.useGet('/users', resend);
  const canInvite = 
    user.status === 'success' && 
    user.result.actions.includes('invite_sponsee');

  return (
    <Content>
      <api.ApiResolver 
        data={response}
        error={() => <Orphan />}
      >
        {users => <UserList users={users} />}
      </api.ApiResolver>
      { canInvite && <InviteButton 
        onInvite={() => {
          setResend(r => r + 1);
          refreshUser();
        }}
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 40
        }}/>}
    </Content>
  );
};

export default Directory;