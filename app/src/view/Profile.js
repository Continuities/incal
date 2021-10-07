/**
 * A user profile
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React from 'react';
import { 
  Container,
  Grid,
  Typography,
  Avatar,
  Box,
  List,
  ListSubheader,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Link,
  ButtonGroup,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Logout,
  PersonAdd,
  PersonRemove,
  ConnectWithoutContact
} from '@mui/icons-material';
import { useGet, ApiResolver, doPut, doDelete } from '@service/api';
import { useCurrentUser, useToken } from '@service/auth';
import UserList from '@view/UserList';
import Content from '@view/Content';

import type { User } from '@service/api';

type Props = {|
  user: User
|};

const Profile = ({ user }: Props):React$Node => {
  const { 
    email, 
    firstname, 
    lastname, 
    sponsors 
  } = user;
  const current = useCurrentUser();
  const [ token,, logout ] = useToken();
  const me = current.status === 'success' ? current.result : null;
  const isMe = me?.email === user.email;
  const isMySponsee = sponsors.find(u => u.email === me?.email) != null;
  const isMySponsor = me?.sponsors.find(s => s.email === email) != null;

  const addSponsor = () => {
    doPut(`/user/${email}/sponsors/${me?.email || ''}`, token);
  };

  const remSponsor = () => {
    doDelete(`/user/${email}/sponsors/${me?.email || ''}`, token);
  };

  return (
    <Grid container 
      direction='column'
      justifyContent='center'
      align='center'
      spacing={3}
    >
      <Grid item>
        <Avatar sx={{
          width: 200,
          height: 200,
          fontSize: 'h1.fontSize'
        }}>
          {firstname[0].toUpperCase()}
        </Avatar>
      </Grid>
      <Grid item>
        <Typography variant='h1'>{firstname} {lastname}</Typography>
        <Typography 
          component={Link} 
          variant='caption'
          href={`mailto:${email}`}
          target='_blank'
          color='textPrimary'
        >{email}</Typography>
      </Grid>
      <Grid item>
        <ButtonGroup size='small'>
          { isMe && (
            <Tooltip title='Logout'>
              <IconButton onClick={logout}>
                <Logout />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && !isMySponsee && !isMySponsor && (
            <Tooltip title='Offer sponsorship'>
              <IconButton onClick={addSponsor}>
                <PersonAdd />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && isMySponsee && (
            <Tooltip title='Remove sponsorship'>
              <IconButton onClick={remSponsor}>
                <PersonRemove />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && !isMySponsee && !isMySponsor && (
            <Tooltip title='Request sponsorship'>
              <IconButton>
                <ConnectWithoutContact />
              </IconButton>
            </Tooltip>
          )}
        </ButtonGroup>
      </Grid>
      <Grid item>
        <Box mx={7}>
          <UserList 
            title='Sponsors' 
            users={sponsors} />
        </Box>
      </Grid>
    </Grid>
  )
};

export default Profile;