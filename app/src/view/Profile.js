/**
 * A user profile
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React, { useState } from 'react';
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
  ConnectWithoutContact,
  Anchor,
  Close
} from '@mui/icons-material';
import { useGet, ApiResolver, doPut, doDelete } from '@service/api';
import { useCurrentUser, useToken } from '@service/auth';
import UserList from '@view/UserList';
import Content from '@view/Content';
import Username from '@view/Username';

import type { User } from '@service/api';
import type { UserAction } from "../service/api";

type Props = {|
  user: User,
  refresh: () => void
|};

const Profile = ({ user, refresh }: Props):React$Node => {
  const { 
    email, 
    firstname, 
    lastname, 
    sponsors,
    actions
  } = user;
  const [ current, ] = useCurrentUser();
  const [ token,, logout ] = useToken();
  const [ disableButtons, setDisableButtons ] = useState(false);
  const me = current.status === 'success' ? current.result : null;
  const isMe = me?.email === user.email;
  const userActions:Set<UserAction> = new Set(actions);

  const canSponsor = userActions.has('sponsor') || userActions.has('remove_sponsor');

  const button = func => async () => {
    setDisableButtons(true);
    await func();
    refresh();
    setDisableButtons(false);
  };

  const isAnchor = user.tags.includes('anchor');

  const addSponsor = button(() => doPut(`/user/${email}/sponsors/${me?.email || ''}`, token));
  const remSponsor = button(() => doDelete(`/user/${email}/sponsors/${me?.email || ''}`, token));
  const addAnchor = button(() => doPut(`/anchors/${email}`, token));
  const removeAnchor = button(() => doDelete(`/anchors/${email}`, token));

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
      <Grid item align='center'>
        <Username user={user} variant='h1' justify='center' />
        <Typography 
          component={Link} 
          variant='caption'
          href={`mailto:${email}`}
          target='_blank'
          color='textPrimary'
        >{email}</Typography>
      </Grid>
      <Grid item>
        <ButtonGroup size='small' disabled={disableButtons}>
          { isMe && (
            <Tooltip title='Logout'>
              <IconButton onClick={logout}>
                <Logout />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && !userActions.has('remove_sponsor') && (
            <Tooltip title='Offer sponsorship'>
              <IconButton 
                disabled={!userActions.has('sponsor')}
                onClick={addSponsor}
              >
                <PersonAdd />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && userActions.has('remove_sponsor') && (
            <Tooltip title='Remove sponsorship'>
              <IconButton onClick={remSponsor}>
                <PersonRemove />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && (
            <Tooltip title='Request sponsorship'>
              <IconButton
                disabled={!userActions.has('request_sponsor')}
              >
                <ConnectWithoutContact />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && userActions.has('add_anchor') && (
            <Tooltip title='Make anchor'>
              <IconButton onClick={addAnchor}>
                <Anchor />
              </IconButton>
            </Tooltip>
          )}
          { !isMe && userActions.has('remove_anchor') && (
            <Tooltip title='Revoke anchor'>
              <IconButton onClick={removeAnchor}>
                <Close />
              </IconButton>
            </Tooltip>
          )}
        </ButtonGroup>
      </Grid>
      <Grid item>
        <Box mx={7}>
          <UserList 
            title={isAnchor ? 'Co-Anchors' : 'Sponsors' }
            users={sponsors} />
        </Box>
      </Grid>
    </Grid>
  )
};

export default Profile;