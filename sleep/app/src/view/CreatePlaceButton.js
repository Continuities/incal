/**
 * Button and dialog for creating a new Place
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React, { useState, createRef } from 'react';
import { api } from '@authweb/service';
import { PlaceMedia } from '@view/Places';
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
import { Add } from '@mui/icons-material';
import { Amenities } from '@service/place';
import { useSnack } from '@service/snackbar';
import { 
  AmenityIcon, 
  AmenityLabel,
  AmenityValueDialog
} from '@view/Amenity';

import type { Place, Amenity } from '@service/place';
import type { AmenityDefinition, AmenityType } from "../service/place";

type Props = {|
  sx?: any,
  onCreate?: () => void
|};

const CreatePlaceButton = ({ sx, onCreate }: Props):React$Node => {
  const [ showDialog, setShowDialog ] = useState(false);
  const [ place, setPlace ] = useState<Place>({
    id: '',
    name: '',
    amenities: [],
    bookings: []
  });
  const [ error, setError ] = useState(null);
  const Api = api.useApi();
  
  const close = () => setShowDialog(false);
  const create = async e => {
    e.preventDefault();
    const response = await Api.doPost(
      '/place', 
      null, 
      JSON.stringify(place)
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
  const set = (key:string, value) => setPlace(p => ({
    ...p,
    [key]: value
  }));

  return (
    <>
      <Fab color='primary' sx={sx} onClick={() => setShowDialog(true)}>
        <Add />
      </Fab>
      <Dialog 
        fullScreen
        component='form'
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        onSubmit={create}
      >
        <DialogTitle>Add Place</DialogTitle>
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
            <DialogActions>
              <Button onClick={close}>Cancel</Button>
              <Button type='submit'>Create</Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
};

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
    if (!def.value) {
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

export default CreatePlaceButton;