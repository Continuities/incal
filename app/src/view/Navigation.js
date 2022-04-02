/**
 * Simple horizontal nav menu
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import { 
  Link, 
  useLocation 
} from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import {
  AccountCircle,
  Contacts,
  Settings
} from '@mui/icons-material';

const tabs = {
  '/': [ AccountCircle, 'Profile' ],
  '/users': [ Contacts, 'Directory' ],
  '/settings': [ Settings, 'Settings' ],
};

const Navigation = ():React$Node => {
  const location = useLocation();
  
  return (
    <BottomNavigation value={location.pathname}>
      {/* $FlowFixMe[incompatible-use] this destructure is safe */}
      {Object.entries(tabs).map(([path, [ Icon, label ]]) => (
        <BottomNavigationAction 
          key={path}
          component={Link}
          to={path}
          value={path}
          label={label} 
          icon={<Icon />} />
      ))}
    </BottomNavigation>
  );
};

export default Navigation;