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
import { useGet, ApiResolver } from '@service/api';
import { useCurrentUser } from "@service/auth";
import UserList from '@view/UserList';
import Content from '@view/Content';
import Orphan from '@view/Orphan';
import InviteButton from '@view/InviteButton';

const Directory = ():React$Node => {
  const [ user, refreshUser ] = useCurrentUser();
  const [ resend, setResend ] = useState(0);
  const response = useGet('/users', resend);
  const canInvite = 
    user.status === 'success' && 
    user.result.actions.includes('invite_sponsee');

  return (
    <Content>
      <ApiResolver 
        data={response}
        error={() => <Orphan />}
      >
        {users => <UserList users={users} />}
      </ApiResolver>
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