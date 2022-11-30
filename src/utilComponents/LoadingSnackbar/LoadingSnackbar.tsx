import { CircularProgress, Snackbar } from '@mui/material';
import React from 'react';

import SlideTransition from '../SlideTransition';

import './LoadingSnackbar.css';

interface ILoadingSnackbarProps {
    isOpen: boolean,
    title: string,
}

const LoadingSnackbar = (props: ILoadingSnackbarProps) => {
  const { isOpen, title } = props;

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      autoHideDuration={1000}
      message={(
        <>
          <strong>{title.replace(/-em$/, '-!').replace(/-qm$/, '-?')}</strong>
          <p>Fetching details...</p>
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
