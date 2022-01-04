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
import { AmenityTag } from '@view/Amenity';
import { PlaceMedia } from '@view/Places';
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button
} from '@mui/material';
import {
  Home
} from '@mui/icons-material';
import { 
  useDates,
  areDatesValid
} from '@service/date';
import { 
  useReserve, 
  isAvailable 
} from '@service/place'

const Place = ():React$Node => {
  const { id } = useParams();
  const [ data, refresh ] = usePlace(id);
  const [ dates ] = useDates();
  const reserve = useReserve(id, refresh);
  
  return (
    <api.ApiResolver data={data}>
      {place => { 
        const available = isAvailable(place, dates);
        return (
          <Stack direction='column' spacing={4}>
            <PlaceMedia place={place} />
            <Stack direction='row' spacing={1} alignItems='center'>
              <Typography variant='h1'>
                {place.name}
              </Typography>
              <Typography color={available ? 'success.main' : 'error.main' }>
                { available ? 'Available' : 'Unavailable' }
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              {place.amenities.map(amenity => (
                <Grid key={amenity.type} item xs={6}>
                  <AmenityTag amenity={amenity} />
                </Grid>
              ))}
            </Grid>
            <Button 
              fullWidth 
              variant='contained'
              color='primary'
              disabled={!available}
              onClick={reserve}
            >Reserve</Button>
          </Stack>
        );
      }}
    </api.ApiResolver>
  )
};

export default Place;