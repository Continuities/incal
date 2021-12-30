/**
 * Button and dialog for creating a new Place
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React, { useState } from 'react';
import { api } from '@authweb/service';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button
} from '@mui/material';
import { Add } from '@mui/icons-material';

type Props = {|
  sx?: any,
  onCreate?: () => void
|};

const CreatePlaceButton = ({ sx, onCreate }: Props):React$Node => {
  const [ showDialog, setShowDialog ] = useState(false);
  const [ name, setName ] = useState('');
  const [ error, setError ] = useState(null);
  const Api = api.useApi();
  
  const close = () => setShowDialog(false);
  const create = async e => {
    e.preventDefault();
    const response = await Api.doPost(
      '/place', 
      null, 
      JSON.stringify({ name })
    );
    if (response.status === 'error') {
      setError(response.description);
    }
    else {
      onCreate && onCreate();
      setError(null);
      close();
    }
  };

  return (
    <>
      <Fab color='primary' sx={sx} onClick={() => setShowDialog(true)}>
        <Add />
      </Fab>
      <Dialog 
        component='form'
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        onSubmit={create}
      >
        <DialogTitle>Add Place</DialogTitle>
        <DialogContent>
          <TextField 
            required 
            autoFocus
            fullWidth
            margin="dense"
            variant="standard"
            value={name} 
            onChange={e => setName(e.target.value)} />
          <DialogActions>
            <Button onClick={close}>Cancel</Button>
            <Button type='submit'>Create</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  )
};

export default CreatePlaceButton;