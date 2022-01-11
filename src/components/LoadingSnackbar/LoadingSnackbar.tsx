import { CircularProgress, Snackbar } from '@mui/material';
import React from 'react';

import SlideTransition from '../../utilComponents/SlideTransition';

import './LoadingSnackbar.css';

interface ILoadingSnackbarProps {
    isOpen: boolean,
    name: string,
}

const LoadingSnackbar: React.FC<ILoadingSnackbarProps> = (
  { isOpen, name }: ILoadingSnackbarProps,
) => (
  <Snackbar
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    autoHideDuration={1000}
    message={(
      <>
        <strong>{name}</strong>
        <p>Loading base stats...</p>
        <br />
        <CircularProgress />
      </>
    )}
    open={isOpen}
    TransitionComponent={SlideTransition}
  />
);

export default LoadingSnackbar;
