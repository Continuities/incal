/**
 * Place details page
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React from 'react';
import { format } from 'date-fns';
import { api } from '@authweb/service';
import { usePlace } from '@service/place';
import { useParams } from 'react-router-dom';
import { AmenityTag } from '@view/Amenity';
import { PlaceMedia } from '@view/Places';
import PlaceDialogButton from "@view/PlaceDialogButton";
import {
  Box,
  Typography,
  Stack,
  Grid,
  Button,
  Link,
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Home,
  Delete
} from '@mui/icons-material';
import { 
  useDates,
  areDatesValid
} from '@service/date';
import { 
  useReserve, 
  isAvailable,
  useCancel
} from '@service/place'

import type { Place } from '@service/place';

const PlacePage = ():React$Node => {
  const { id } = useParams();
  const [ data, refresh ] = usePlace(id);
  const [ dates ] = useDates();
  const reserve = useReserve(id, refresh);
  const cancel = useCancel();
  
  return (
    <api.ApiResolver data={data}>
      {(place:Place) => { 
        const available = isAvailable(place, dates);
        const canEdit = place.tags?.includes('editable');
        return (
          <>
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
              <List>
                <ListSubheader>Reservations</ListSubheader>
                {place.bookings.map(booking => (
                  // TODO: Switch guestId to a UserStub so we can do a proper user display
                  <ListItem 
                    disablePadding
                    key={booking.id}
                    secondaryAction={canEdit && (
                      <IconButton onClick={() => cancel(place.id, booking.id).then(refresh)}>
                        <Delete />
                      </IconButton>
                    )}
                  >
                    <ListItemButton 
                      component={Link} 
                      target='_blank'
                      href={`${String(process.env.DASHBOARD_URI)}/${booking.guestId}`}
                    >
                      <ListItemIcon>
                        <Avatar>{(booking.guestId)[0]}</Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={booking.guestId} 
                        secondary={`${format(booking.start, 'MMM dd, yyyy')} - ${format(booking.end, 'MMM dd, yyyy')}`} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Stack>
            {canEdit && (
              <PlaceDialogButton 
                edit={place}
                onComplete={refresh}
                sx={{
                  position: 'fixed',
                  right: '10%',
                  bottom: '10%'
                }}/>
            )}
          </>
        );
      }}
    </api.ApiResolver>
  )
};

export default PlacePage;