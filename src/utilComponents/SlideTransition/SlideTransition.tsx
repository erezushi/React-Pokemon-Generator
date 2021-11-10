import { Slide } from '@material-ui/core';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import React from 'react';

const SlideTransition: React.FC<TransitionProps> = (props: TransitionProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Slide {...props} direction="right" />
);

export default SlideTransition;
