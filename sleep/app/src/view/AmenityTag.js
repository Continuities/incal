/**
 * Renders an amenity key/value
 * @author mtownsend
 * @since December 29, 2021
 * @flow
 **/

import React from 'react';
import {
  Stack,
  Typography
} from '@mui/material';
import {
  Hotel,
  Fireplace
} from '@mui/icons-material';

import type { Amenity } from '@service/place';

type Props = {|
  amenity: Amenity
|}

const AmenityTag = ({ amenity }: Props): React$Node => (
  <Stack direction='row' alignItems='center' spacing={1}>
    <AmenityIcon type={amenity.type} />
    <Typography fontWeight='medium'><AmenityLabel type={amenity.type} /></Typography>
    <Typography><AmenityValue value={amenity.value} /></Typography>
  </Stack>
);

const AmenityIcon = ({ type }) => {
  switch (type) {
    case 'sleeps': return <Hotel />;
    case 'heated': return <Fireplace />;
    default: return null;
  }
};

const AmenityLabel = ({ type }) => {
  switch (type) {
    case 'sleeps': return 'sleeps';
    case 'heated': return 'heated';
    default: return null;
  }
};

const AmenityValue = ({ value }) => {
  switch (typeof value) {
    case 'string': return value;
    case 'number': return String(value);
    case 'boolean': return value ? 'yes' : 'no'
    default: return String(value);
  }
};

export default AmenityTag;