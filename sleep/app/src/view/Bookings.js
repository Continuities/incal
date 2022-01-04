/**
 * View for managing your reservations
 * @author mtownsend
 * @since January 04, 2022
 * @flow
 **/

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useUser } from '@service/user';
import { usePlaces, useCancel } from '@service/place';
import { api } from '@authweb/service';
import { Link } from 'react-router-dom';
import {
  Stack,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { PlaceMedia } from '@view/Places';
import { AmenityTag } from '@view/Amenity';

import type { Place } from '@service/place';

const Bookings = ():React$Node => {
  const [ user ] = useUser();
  const [ response, refresh ] = usePlaces({ guest: user?.email ?? 'NONE' });
  const [ cancelling, setCancelling ] = useState(null);
  const cancel = useCancel();

  return (
    <>
      <Stack direction='column' my={5} spacing={5}>
        <api.ApiResolver data={response}>
          { (places:Array<Place>) => {
            const bookings = places
              .flatMap(p => p.bookings.map(b => [ p, b ]))
              .filter(([p, b]) => b.guestId === user?.email);
            bookings.sort(([,a], [,b]) => a.start - b.start);
            return bookings.length === 0 ? (
              <Typography align='center' variant='caption'>You have no upcoming reservations</Typography>
            ) : (
              bookings.map(([ place, booking ]) => 
                <BookingCard
                  key={`${place.id}-${booking.start.toISOString()}`} 
                  place={place} 
                  booking={booking}
                  onCancel={() => setCancelling([ place, booking ])} />
              )
            );
          }}
        </api.ApiResolver>
      </Stack>
      <CancelDialog 
        open={Boolean(cancelling)} 
        onClose={() => setCancelling(null)}
        onApprove={() => {
          cancelling && cancel(cancelling[0].id, cancelling[1].id)
            .then(refresh);
        }}
        place={cancelling?.[0]}
        booking={cancelling?.[1]} />
    </>
  )
};

const BookingCard = ({ place, booking, onCancel }) => (
  <Card>
    <CardActionArea component={Link} to={`/place/${place.id}`}>
      <PlaceMedia place={place} />
      <CardContent>
        <Stack direction='column' spacing={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='h5'>
              {place.name}
            </Typography>
            { booking.status === 'pending' && (
              <Chip 
                color='info' 
                label='pending approval'/>
            )}
            { booking.status === 'denied' && (
              <Chip 
                color='error' 
                label='denied'/>
            )}
          </Stack>
          <Stack direction='row' spacing={2}>
            <DateView date={booking.start} />
            <Typography>-</Typography>
            <DateView date={booking.end} />
          </Stack>
        </Stack>
      </CardContent>
    </CardActionArea>
    <CardActions>
      <Button size="small" color="error" onClick={onCancel}>
        Cancel
      </Button>
    </CardActions>
  </Card>
);

const CancelDialog = ({ open, place, booking, onClose, onApprove }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Cancel reservation?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to cancel your {booking && format(booking.start, 'MMMM do, yyyy')} reservation of {place?.name}?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Keep it</Button>
      <Button onClick={() => {
        onApprove();
        onClose();
      }} color='error'>
        Cancel it
      </Button>
    </DialogActions>
  </Dialog>
);

const DateView = ({ date }) => date == null ? null : (
  <Typography>
    {format(date, 'MMMM do, yyyy')}
  </Typography>
);

export default Bookings;