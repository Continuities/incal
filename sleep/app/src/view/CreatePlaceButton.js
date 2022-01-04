/**
 * Button and dialog for creating a new Place
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React, { useState } from 'react';
import { api } from '@authweb/service';
import PlacePhoto from '@view/PlacePhoto';
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
            <PlacePhoto place={place} />
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