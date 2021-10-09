/**
 * Settings page
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import Content from '@view/Content';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Logout
} from '@mui/icons-material';
import { useToken } from '@service/auth';

const Settings = ():React$Node => {
  const [,,logout] = useToken();
  return (
    <Content>
      <List>
        <ListItemButton onClick={logout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary='Logout'/>
        </ListItemButton>
      </List>
    </Content>
  );
};

export default Settings;