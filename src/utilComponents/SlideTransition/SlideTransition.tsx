import { Slide, SlideProps } from '@mui/material';
import React from 'react';

type TransitionProps = Omit<SlideProps, 'direction'>

const SlideTransition = (props: TransitionProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Slide {...props} direction="right" />
);

export default SlideTransition;
