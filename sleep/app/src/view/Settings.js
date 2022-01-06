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

const Settings = ():React$Node => {
  const logout = () => {
    console.log('TODO');
  };
  return (
    <List>
      <ListItemButton onClick={logout}>
        <ListItemIcon>
          <Logout />
        </ListItemIcon>
        <ListItemText primary='Logout'/>
      </ListItemButton>
    </List>
  );
};

export default Settings;