/**
 * Only thing an ophan can see
 * @author mtownsend
 * @since October 11, 2021
 * @flow
 **/

import React from 'react';
import { 
  Grid,
  Typography
} from '@mui/material';

const Orphan = ():React$Node => (
  <Grid container direction='column' sx={{
    height: 1,
    width: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <Typography variant='h1' sx={{ my: 4 }}>
      Find a sponsor!
    </Typography>
    <Typography>
      Before you can join us, you'll need to find a sponsor in the community. Ask your friends, and we'll see you soon!
    </Typography>
  </Grid>
);

export default Orphan;