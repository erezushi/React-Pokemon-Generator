import React from 'react';
import { CircularProgress, Snackbar } from '@mui/material';

import SlideTransition from '../SlideTransition';

import './LoadingSnackbar.css';

interface ILoadingSnackbarProps {
  isOpen: boolean;
  title: string;
}

const LoadingSnackbar = (props: ILoadingSnackbarProps) => {
  const { isOpen, title } = props;

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      autoHideDuration={1000}
      className="loading-snackbar"
      message={
        <>
          <strong>{title.replace(/-em$/, '-!').replace(/-qm$/, '-?')}</strong>
          <p>Fetching details...</p>
          <br />
          <CircularProgress />
        </>
      }
      open={isOpen}
      slots={{ transition: SlideTransition }}
    />
  );
};

export default LoadingSnackbar;
