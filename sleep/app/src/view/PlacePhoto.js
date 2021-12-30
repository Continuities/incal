/**
 * Renders a place photo or placeholder
 * @author mtownsend
 * @since December 30, 2021
 * @flow
 **/

import React from 'react';
import {
  Box
} from '@mui/material';
import {
  Home
} from '@mui/icons-material';

import type { Place } from '@service/place';

type Props = {|
  place: Place
|}

const PlacePhoto = ({ place }: Props):React$Node => (
  <Box 
    component={ place.photo ? 'img' : 'div'}
    sx={{
      height: 140,
      bgcolor: 'grey.300',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    image={place.photo}
    alt={place.name}
  >
    {!place.photo && (
      <Home sx={{
        color: 'background.default',
        fontSize: '6rem'
      }} />
    )}
  </Box>
);

export default PlacePhoto;