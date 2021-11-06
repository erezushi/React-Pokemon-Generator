import { Lens, RadioButtonChecked } from '@material-ui/icons';
import React from 'react';

import './AppHeader.css';

const Header: React.FC = () => (
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
