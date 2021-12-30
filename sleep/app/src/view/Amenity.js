/**
 * Amenities view components
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import {
  Hotel,
  Fireplace
} from '@mui/icons-material';
import { Amenities } from '@service/place';

import type { Amenity, AmenityType } from '@service/place';

type TagProps = {|
  amenity: Amenity
|}

export const AmenityTag = ({ amenity }: TagProps): React$Node => (
  <Stack direction='row' alignItems='center' spacing={1}>
    <AmenityIcon type={amenity.type} />
    <Typography fontWeight='medium'><AmenityLabel type={amenity.type} /></Typography>
    {amenity.value != null && <Typography><AmenityValue value={amenity.value} /></Typography>}
  </Stack>
);

export const AmenityIcon = ({ type, ...props }: { type: AmenityType }):React$Node => {
  const Icon = Amenities.get(type)?.Icon;
  return Icon ? <Icon {...props} /> : null;
};

export const AmenityLabel = ({ type }: { type: ?AmenityType }): React$Node => 
  type ? (Amenities.get(type)?.label ?? null) : 0;

const AmenityValue = ({ value }) => {
  switch (typeof value) {
    case 'string': return value;
    case 'number': return String(value);
    default: return String(value);
  }
};

type DialogProps = {|
  amenity: ?Amenity,
  onClose: () => void,
  onSubmit: Amenity => void
|};
export const AmenityValueDialog = ({ amenity, onClose, onSubmit }: DialogProps):React$Node => {
  const [ value, setValue ] = useState(amenity?.value ?? '');
  const def = amenity && Amenities.get(amenity.type);
  return (
    <Dialog 
      open={Boolean(amenity)} 
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        amenity && onSubmit({ 
          type: amenity.type, 
          value
        });
        onClose();
      }}
      onClose={onClose}
      component='form'
    >
      <DialogTitle><AmenityLabel type={amenity?.type} /></DialogTitle>
      <DialogContent>
        <TextField 
          autoFocus
          required
          type={def?.value} 
          value={value} 
          onChange={e => setValue(e.target.value)}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type='submit'>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AmenityTag;