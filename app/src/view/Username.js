/**
 * Render a user name, with optional decorations
 * @author mtownsend
 * @since October 09, 2021
 * @flow
 **/

import React from 'react';
import { 
  Typography,
  Grid,
  Tooltip
} from '@mui/material';
import { 
  Anchor,
  LinkOff,
  MarkunreadMailboxOutlined
} from '@mui/icons-material';

import type { User, UserStub } from '@authweb/service';

type Props = {|
  user:User | UserStub,
  variant?:string,
  justify?: string
|};

const Username = ({ user, variant = 'body1', justify = 'flex-start' }: Props):React$Node => (
  <Grid container sx={{
    alignItems: 'center',
    justifyContent: justify
  }}>
      <Typography variant={variant}>
        { user.firstname && user.lastname ? 
          `${user.firstname} ${user.lastname}` : 
          user.email }
      </Typography>
      { user.tags.map(tag => (
        <UserTag tag={tag} variant={variant} key={tag} />
      ))}
  </Grid>
);

const UserTag = ({ tag, variant }) => {
  const sx = {
    typography: variant,
    ml: 1
  };
  switch (tag) {
    case 'anchor':
      return (
        <Tooltip title='Anchor member'>
          <Anchor sx={sx} />
        </Tooltip>
      );
    case 'orphan':
      return (
        <Tooltip title='No sponsors'>
          <LinkOff sx={sx} />
        </Tooltip>
      );
    case 'invite-pending':
      return (
        <Tooltip title='Invited'>
          <MarkunreadMailboxOutlined sx={sx} />
        </Tooltip>
      )
  }
  return null;
};

export default Username;