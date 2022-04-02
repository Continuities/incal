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
import { auth } from '@authweb/service';

const Settings = ():React$Node => {
  const { deleteToken } = auth.useToken();
  return (
    <Content>
      <List>
        <ListItemButton onClick={deleteToken}>
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