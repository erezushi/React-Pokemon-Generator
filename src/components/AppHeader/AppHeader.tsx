import React from 'react';
import Lens from '@mui/icons-material/Lens';
import RadioButtonChecked from '@mui/icons-material/RadioButtonChecked';

import './AppHeader.css';

const Header = () => (
  <div className="app-header">
    <div className="header-top">
      Random Pokémon
    </div>
    <Lens className="header-button background" fontSize="large" />
    <RadioButtonChecked className="header-button" fontSize="large" />
    <div className="header-bottom">
      Generator
    </div>
  </div>
);

export default Header;
