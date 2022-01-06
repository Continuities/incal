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
import { AmenityTag } from '@view/Amenity';
import PlaceDialogButton from '@view/PlaceDialogButton';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Stack,
  Grid,
  Fab
} from '@mui/material';
import {
  Home,
  Add
} from '@mui/icons-material';
import { useUser } from '@service/user';
import { isAvailable } from '@service/place';
import { useDates } from '@service/date';

import type { Place } from '@service/place';

const Places = ():React$Node => {

  const [ response, refresh ] = usePlaces();
  const [ user ] = useUser();

  return (
    <>
      <Stack direction='column' my={5} spacing={5}>
        <api.ApiResolver data={response}>
          {(places:Array<Place>) => places.length === 0 ? (
            <Typography 
              align="center"
              variant='caption'
            >
              There are no places to reserve
            </Typography>
          ) : places.map(place => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </api.ApiResolver>
      </Stack>
      { user?.tags.includes('can-create') && (
        <PlaceDialogButton 
          onComplete={refresh}
          sx={{
            position: 'fixed',
            right: '10%',
            bottom: '10%'
          }}/>
        )}
    </>
  );
};

const PlaceCard = ({ place }) => {
  const [ dates ] = useDates();
  const available = isAvailable(place, dates);
  return (
    <Card>
      <CardActionArea component={Link} to={`/place/${place.id}`}>
        <PlaceMedia place={place} />
        <CardContent>
          <Stack direction='row' spacing={1} mb={2} alignItems='center'>
            <Typography variant='h5'>
              {place.name}
            </Typography>
            <Typography color={available ? 'success.main' : 'error.main'}>
              {available ? 'Available' : 'Unavailable' }
            </Typography>
          </Stack>
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
};

type MediaProps = {|
  place: Place,
  sx?: any
|}
export const PlaceMedia = ({ place, sx = {} }: MediaProps):React$Node => {
  return (
    <CardMedia component={ place.photo ? 'img' : 'div'}
      sx={{
        height: 200,
        bgcolor: 'grey.300',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
      image={place.photo && `api/public/${place.photo}`}
      alt={place.name}
      children={place.photo ? undefined : (
        <Home sx={{
          color: 'background.default',
          fontSize: '6rem'
        }} />
      )}
    />
  );
};

export default Places;