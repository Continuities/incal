/**
 * Render a user name, with optional decorations
 * @author mtownsend
 * @since October 09, 2021
 * @flow
 **/

import React from 'react';
import { 
  Typography,
  Grid
} from '@mui/material';
import { 
  Anchor,
  LinkOff
} from '@mui/icons-material';

import type { User, UserStub } from '@service/api';

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
      <Typography variant={variant} sx={{ mr: 1 }}>
        {user.firstname} {user.lastname}
      </Typography>
      { user.tags.map(tag => (
        <UserTag tag={tag} variant={variant} key={tag} />
      ))}
  </Grid>
);

const UserTag = ({ tag, variant }) => {
  switch (tag) {
    case 'anchor':
      return <Anchor sx={{ typography: variant }} />
    case 'orphan':
      return <LinkOff sx={{ typography: variant }} />
  }
  return null;
};

export default Username;