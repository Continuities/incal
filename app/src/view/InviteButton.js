/**
 * FAB for inviting a user
 * @author mtownsend
 * @since October 11, 2021
 * @flow
 **/

import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button
} from '@mui/material';
import {
  PersonAdd
} from '@mui/icons-material';
import { useToken } from '@service/auth';
import { doPut } from '@service/api';

type Props = {|
  onInvite?:() => void,
  sx?:any
|};

const InviteButton = ({ sx, onInvite }: Props):React$Node => {
  const [ isDialogOpen, setDialogOpen ] = useState(false);
  const [ email, setEmail ] = useState('');
  const [ error, setError ] = useState(null);
  const [ success, setSuccess ] = useState(false);
  const [ token ] = useToken();

  const close = () => setDialogOpen(false);
  const invite = async e => {
    e.preventDefault();
    const response = await doPut(`/user/sponsees/${email}`, token);
    if (response.status === 'error') {
      setError(response.description);
    }
    else {
      onInvite && onInvite();
      setError(null);
      setSuccess(true);
    }
  };

  return (
    <>
      <Fab 
        color='primary' 
        sx={sx}
        onClick={() => setDialogOpen(true)}
      >
        <PersonAdd />
      </Fab>
      <Dialog 
        open={isDialogOpen} 
        onClose={close} component='form'
        onSubmit={invite}
      >
        <DialogTitle>Invite a Sponsee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            { !success ? 
              'Know someone who would be a good fit for our community? Invite them to join as your sponsee!' : 
              'All set! They should receive an email shortly.'
            }
          </DialogContentText>
          {!success && <TextField 
            type='email'
            error={!!error}
            helperText={error}
            fullWidth
            required
            variant='standard'
            margin='dense'
            label='Email address'
            value={email} 
            onChange={e => setEmail(e.target.value)}/>}
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>{success ? 'Close' : 'Cancel'}</Button>
          {!success && <Button type='submit'>Invite</Button>}
        </DialogActions>
      </Dialog>
    </>
  )
};

export default InviteButton;