
/**
 * MUI theme
 * https://mui.com/customization/default-theme/
 * @flow
 **/

import { createTheme } from '@mui/material/styles';

type MUITheme = any;

const theme:MUITheme = createTheme({
  palette: {
    // TODO: Palette overrides
  },
  typography: {
    h1: {
      fontSize: '2rem'
    }
  },
  components: {
    // TODO: MUI component overrides
  }
});

export default theme;

