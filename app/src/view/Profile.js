/**
 * A user profile
 * @author mtownsend
 * @since October 07, 2021
 * @flow
 **/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  Logout,
  PersonAdd,
  PersonRemove,
  ConnectWithoutContact,
  Anchor,
  Close,
  AddAPhoto,
  Delete
} from '@mui/icons-material';
import { auth, api } from '@authweb/service';
import UserList from '@view/UserList';
import Content from '@view/Content';
import Username from '@view/Username';

import type { User, UserAction } from '@authweb/service';

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
    sponsees,
    actions,
    photo
  } = user;
  const [ current, refreshCurrent ] = auth.useCurrentUser();
  const { token, deleteToken } = auth.useToken();
  const [ disableButtons, setDisableButtons ] = useState(false);
  const [ tab, setTab ] = useState(0);
  const [ isUploading, setUploading ] = useState(false);
  const me = current.status === 'success' ? current.result : null;
  const isMe = me?.email === user.email;
  const userActions:Set<UserAction> = new Set(actions);
  const Api = api.useApi();
  const navigate = useNavigate();

  const canSponsor = userActions.has('sponsor') || userActions.has('remove_sponsor');

  const button = func => async () => {
    setDisableButtons(true);
    await func();
    refresh();
    refreshCurrent();
    setDisableButtons(false);
  };

  const isAnchor = user.tags.includes('anchor');

  const addSponsor = button(() => Api.doPut(`/user/${email}/sponsors/${me?.email || ''}`, token));
  const remSponsor = button(() => Api.doDelete(`/user/${email}/sponsors/${me?.email || ''}`, token));
  const addAnchor = button(() => Api.doPut(`/anchors/${email}`, token));
  const removeAnchor = button(() => Api.doDelete(`/anchors/${email}`, token));
  const deleteUser = async () => {
    setDisableButtons(true);
    await Api.doDelete(`/user/${email}`, token);
    navigate('/users', { replace: true });
  }

  return (
    <Grid container 
      direction='column'
      justifyContent='center'
      align='center'
      spacing={3}
    >
      <Grid item>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <UploadAvatarButton 
              onBegin={() => setUploading(true)}
              onComplete={() => {
                setUploading(false);
                refresh();
              }}
            />
          }
          invisible={!isMe}
          sx={{ 
            '& .MuiBadge-badge': {
              width: 'auto',
              height: 'auto',
              padding: 0,
              borderRadius: '50%',
              bgcolor: 'background.paper'
            }
          }}
        >
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer + 1 
            }}
            open={isUploading}
            onClick={() => console.log('TODO')}
          />
          { isUploading && <CircularProgress 
            size={180}
            sx={{ 
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 999
            }} /> }
          <Avatar 
            src={photo && `/public/${photo}`}
            sx={{
              width: 200,
              height: 200,
              fontSize: 'h1.fontSize'
            }}
          >
            { (firstname || email)[0].toUpperCase() }
          </Avatar>
        </Badge>
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
              <IconButton onClick={deleteToken}>
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
          { !isMe && userActions.has('delete') && (
            <Tooltip title='Delete user'>
              <IconButton onClick={deleteUser}>
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </ButtonGroup>
      </Grid>
      <Grid item sx={{ mx: 7 }}>
        <Tabs 
          centered 
          value={tab} 
          onChange={(e, v) => setTab(v)}
        >
          <Tab label={isAnchor ? 'Co-Anchors' : 'Sponsors'} />
          <Tab label='Sponsees' />
        </Tabs>
        <UserList 
          users={tab === 0 ? sponsors : sponsees} />
      </Grid>
    </Grid>
  )
};

const UploadAvatarButton = ({ onBegin, onComplete }) => {
  const { token } = auth.useToken();
  const Api = api.useApi();
  return (
    <>
      <IconButton 
        color='primary'
        component='label'
        htmlFor='photo-input'
      >
        <AddAPhoto />
      </IconButton>
      <input 
        type='file'
        id='photo-input'
        name='avatar'
        accept='image/*'
        style={{
          position: 'absolute',
          height: '1px',
          width: '1px',
          overflow: 'hidden',
          clip: 'rect(1px, 1px, 1px, 1px)'
        }}
        onChange={e => {
          const file = e.target?.files?.item(0);
          if (!file) {
            return;
          }
          onBegin();
          const formData = new FormData();
          formData.append('avatar', file);
          Api.doPut('/user/photo', token, formData).finally(onComplete);
        }}/>
    </>
  );
};

export default Profile;