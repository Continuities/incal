/**
 * View for available places
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React from 'react';
import { api } from '@authweb/service';
import { usePlaces } from '@service/place';
import { Link } from 'react-router-dom';
import AmenityTag from '@view/AmenityTag';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Stack,
  Grid
} from '@mui/material';

import {
  Home
} from '@mui/icons-material';

import type { Place } from '@service/place';

const Places = ():React$Node => {

  const [ response, refresh ] = usePlaces();

  return (
    <Stack direction='column' my={5} spacing={5}>
      <api.ApiResolver data={response}>
        {(places:Array<Place>) => places.map(place => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </api.ApiResolver>
    </Stack>
  );
};

const PlaceCard = ({ place }: {| place: Place |}) => (
  <Card>
    <CardActionArea component={Link} to={`/place/${place.id}`}>
      <CardMedia 
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
      </CardMedia>
      <CardContent>
        <Typography variant='h5' mb={2}>
          {place.name}
        </Typography>
        <Grid container spacing={2}>
          {place.amenities.map(amenity => (
            <Grid key={amenity.type} item xs={6}>
              <AmenityTag amenity={amenity} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default Places;