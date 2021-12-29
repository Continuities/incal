/**
 * Settings page
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
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
    <List>
      <ListItemButton onClick={deleteToken}>
        <ListItemIcon>
          <Logout />
        </ListItemIcon>
        <ListItemText primary='Logout'/>
      </ListItemButton>
    </List>
  );
};

export default Settings;