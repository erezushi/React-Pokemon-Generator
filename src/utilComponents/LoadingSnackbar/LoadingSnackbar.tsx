import { CircularProgress, Snackbar } from '@mui/material';
import React from 'react';

import SlideTransition from '../SlideTransition';

import './LoadingSnackbar.css';

interface ILoadingSnackbarProps {
    isOpen: boolean,
    name: string,
}

const LoadingSnackbar = (props: ILoadingSnackbarProps) => {
  const { isOpen, name } = props;

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      autoHideDuration={1000}
      message={(
        <>
          <strong>{name.replace(/-em$/, '-!').replace(/-qm$/, '-?')}</strong>
          <p>Loading base stats...</p>
          <br />
          <CircularProgress />
        </>
    )}
      open={isOpen}
      TransitionComponent={SlideTransition}
    />
  );
};

export default LoadingSnackbar;
