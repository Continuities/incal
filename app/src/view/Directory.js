/**
 * Directory page
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import {
  Box,
  Container
} from '@mui/material';
import { useGet, ApiResolver } from '@service/api';
import UserList from '@view/UserList';
import Content from '@view/Content';

const Directory = ():React$Node => {
  const response = useGet('/users');
  return (
    <Content>
      <ApiResolver data={response}>
        {users => <UserList users={users} />}
      </ApiResolver>
    </Content>
  );
};

export default Directory;