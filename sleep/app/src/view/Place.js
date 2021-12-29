/**
 * Place details page
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React from 'react';
import { api } from '@authweb/service';
import { usePlace } from '@service/place';
import { useParams } from 'react-router-dom';
import AmenityTag from '@view/AmenityTag';
import {
  Box,
  Typography,
  Stack,
  Grid
} from '@mui/material';
import {
  Home
} from '@mui/icons-material';

const Place = ():React$Node => {
  const { id } = useParams();
  const [ data ] = usePlace(id);

  return (
    <api.ApiResolver data={data}>
      {place => (
        <Stack direction='column' spacing={4}>
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
          <Typography variant='h1'>
            {place.name}
          </Typography>
          <Grid container spacing={2}>
            {place.amenities.map(amenity => (
              <Grid key={amenity.type} item xs={6}>
                <AmenityTag amenity={amenity} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </api.ApiResolver>
  )
};

export default Place;