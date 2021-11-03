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
import Username from '@view/Username';

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
      { users.map(user => (
        <ListItemButton 
          component={Link} 
          to={`/${user.email}`}
          key={user.email}
        >
          <ListItemIcon>
            <Avatar src={user.photo && `/public/${user.photo}`}>{(user.firstname || user.email)[0]}</Avatar>
          </ListItemIcon>
          <Username user={user} />
        </ListItemButton>
      ))}
    </List>
  );
}

export default UserList;