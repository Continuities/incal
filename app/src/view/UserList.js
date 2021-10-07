/**
 * Displays a list of user stubs
 * @author mtownsend
 * @since October 08, 2021
 * @flow
 **/

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  List,
  ListSubheader,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';

import type { 
  UserStub, 
  ApiResponse
} from '@service/api';

type Props = {|
  users: Array<UserStub>,
  title?: string
|}

const UserList = ({ users, title }: Props):React$Node => {

  return (
    <List subheader={ title && (
      <ListSubheader>
        {title}
      </ListSubheader>
    )}>
      { users.map(({ email, firstname, lastname }) => (
        <ListItemButton 
          component={Link} 
          to={`/${email}`}
          key={email}
        >
          <ListItemIcon>
            <Avatar>{firstname[0]}</Avatar>
          </ListItemIcon>
          <ListItemText primary={`${firstname} ${lastname}`} />
        </ListItemButton>
      ))}
    </List>
  );
}

export default UserList;