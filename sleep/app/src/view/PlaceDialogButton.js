/**
 * Button and dialog for creating a new Place
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React, { useState, createRef } from 'react';
import { api } from '@authweb/service';
import { PlaceMedia } from '@view/Places';
import { useNavigate } from 'react-router-dom';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button,
  Stack,
  Chip,
  Box,
  Typography,
  Menu,
  MenuItem
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { Amenities } from '@service/place';
import { useSnack } from '@service/snackbar';
import { 
  AmenityIcon, 
  AmenityLabel,
  AmenityValueDialog
} from '@view/Amenity';
import RulesEditor from '@view/RulesEditor';

import type { Place, Amenity } from '@service/place';

type Props = {|
  sx?: any,
  onComplete?: () => void,
  edit?: Place
|};

const PlaceDialogButton = ({ sx, onComplete, edit }: Props):React$Node => {
  const [ showDialog, setShowDialog ] = useState(false);
  const [ place, setPlace ] = useState<Place>({
    id: edit?.id ?? '',
    name: edit?.name ?? '',
    photo: edit?.photo,
    amenities: edit?.amenities ?? [],
    bookings: edit?.bookings ?? [],
    rules: edit?.rules ?? []
  });
  const [ error, setError ] = useState(null);
  const [ isDeleting, setDeleting ] = useState(false);
  const Api = api.useApi();
  const navigate = useNavigate();
  
  const close = () => setShowDialog(false);
  const submit = async e => {
    e.preventDefault();
    const response = edit ? 
      await Api.doPut(`/place/${edit.id}`, null, JSON.stringify(place)): 
      await Api.doPost('/place', null, JSON.stringify(place));
    if (response.status === 'error') {
      setError(response.description);
    }
    else {
      onComplete && onComplete();
      setError(null);
      close();
    }
  };
  const deletePlace = async () => {
    const response = await Api.doDelete(`/place/${String(edit?.id)}`);
    if (response.status === 'error') {
      setError(response.description);
    }
    else {
      setError(null);
      close();
      navigate('/', { replace: true });
    }
  };
  const set = (key:string, value) => setPlace(p => ({
    ...p,
    [key]: value
  }));

  return (
    <>
      <Fab color='primary' sx={sx} onClick={() => setShowDialog(true)}>
        {edit ? <Edit /> : <Add />}
      </Fab>
      <Dialog 
        fullScreen
        component='form'
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        onSubmit={submit}
      >
        <DialogTitle>{`${edit ? 'Edit' : 'Add'} Place`}</DialogTitle>
        <DialogContent>
          <Stack direction='column' spacing={2}>
            <UploadPhotoButton 
              place={place}
              onBegin={() => console.log('begin')}
              onComplete={(filename) => set('photo', filename)}
            >
              <PlaceMedia place={place} />
            </UploadPhotoButton>
            <TextField 
              required 
              autoFocus
              fullWidth
              label="Name"
              variant="standard"
              value={place.name} 
              onChange={e => set('name', e.target.value)} />
            <AmenitiesList 
              amenities={place.amenities} 
              onChange={amenities => set('amenities', amenities)} />
            <RulesEditor 
              rules={place.rules} 
              onAdd={rule => setPlace(p => ({ 
                ...p, rules: [ ...p.rules, rule ]
              }))}
              onDelete={index => setPlace(p => ({
                ...p,
                rules: p.rules.filter((_,i) => i !== index)
              }))}
              onChange={(index, rule) => setPlace(p => ({
                ...p,
                rules: p.rules.map((r, i) => i === index ? rule : r)
              }))}
            />
            <DialogActions>
              <Button onClick={close}>Cancel</Button>
              <Button type='submit'>{edit ? 'Update' : 'Create'}</Button>
              {edit && <Button color='error' onClick={() => setDeleting(true)}>Delete</Button>}
            </DialogActions>
          </Stack>
        </DialogContent>
        <DeleteDialog 
          open={isDeleting} 
          onClose={() => setDeleting(false)} 
          onDelete={deletePlace} />
      </Dialog>
    </>
  )
};

const DeleteDialog = ({ open, onClose, onDelete }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Are you sure?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete this place? This cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button color='error' onClick={() => {
        onDelete();
        onClose();
      }}>Delete</Button>
    </DialogActions>
  </Dialog>
);

const UploadPhotoButton = ({ onBegin, onComplete, children, place }) => {
  const Api = api.useApi();
  const ref = createRef();
  const [ , setSnack ] = useSnack();
  return (
    <Box 
      onClick={() => ref.current?.click()}
      sx={{
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {children}
      <Stack 
        alignItems='center' 
        justifyContent='center'
        sx={{
          position: 'absolute',
          top: 0,
          width: 1,
          height: 1,
          transition: 'background-color 400ms',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        <Typography sx={{
          color: 'white',
          textShadow: '0 0 5px black',
          fontSize: 'h4.fontSize'
        }}>
          Upload photo
        </Typography>
      </Stack>
      <input 
        type='file'
        id='photo-input'
        name='avatar'
        accept='image/*'
        ref={ref}
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
          formData.append('photo', file);
          Api
            .doPost(`/photo`, null, formData)
            .then(r => {
              if (r.status === 'success') {
                onComplete(r.result.filename)
              }
            })
            .catch((e) => {
              setSnack({ type: 'error', text: e });
              onComplete(null);
            });
        }}/>
    </Box>
  );
};

const AmenitiesList = ({ amenities, onChange }) => {
  const [ menuAnchor, setMenuAnchor ] = useState(null);
  const amenitySet = new Set(amenities.map(a => a.type));
  const unusedAmenities = [...Amenities].filter(([k]) => !amenitySet.has(k));
  const [ editing, setEditing ] = useState<?Amenity>(null);

  const onSelect = type => {
    const def = Amenities.get(type);
    if (!def) { return; }
    if (!def.valueType) {
      onChange([ ...amenities, { type } ]);
      return;
    }

    setEditing({ type });
  };

  return (
    <Box>
      <Typography variant='h6'>
        Amenities
      </Typography>
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        
        { amenities.map(a => (
          <Chip 
            key={a.type}
            label={<>
              <AmenityLabel type={a.type} />
              {a.value != null ? ` ${a.value}` : ''}
            </>} 
            icon={<AmenityIcon type={a.type} />}
            onDelete={() => onChange(amenities.filter(b => b.type !== a.type))}
            sx={{
              mb: 1,
              mr: 1
            }}
          />
        ))}
        {unusedAmenities.length > 0 && <Chip 
          color='primary'
          icon={<Add />}
          label='Add' 
          onClick={e => setMenuAnchor(e.currentTarget)} 
          sx={{
              mb: 1,
              mr: 1
          }}/>}
      </Box>
      <AmenitiesMenu 
        anchor={menuAnchor} 
        options={unusedAmenities}
        onClose={() => setMenuAnchor(null)}
        onSelect={onSelect}
      />
      <AmenityValueDialog
        amenity={editing}
        onClose={() => setEditing(null)}
        onSubmit={amenity => onChange([ ...amenities, amenity ])} 
      />
    </Box>
  );
}

const AmenitiesMenu = ({ options, anchor, onClose, onSelect }) => (
  <Menu 
    open={Boolean(anchor)} 
    onClose={onClose}
    anchorEl={anchor}
  >
    { options.map(([ type, amenity ]) => (
      <MenuItem key={type} onClick={() => {
        onSelect(type);
        onClose();
      }}>
        {amenity.label}
      </MenuItem>
    ))}
  </Menu>
);

export default PlaceDialogButton;