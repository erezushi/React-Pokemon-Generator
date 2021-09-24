import React from 'react';
import './App.css';
import Header from './components/AppHeader';
import OptionsBox from './components/OptionsBox';
import PokemonList from './components/PokemonList';

function App() {
  return (
    <div className="app">
      <Header />
      <OptionsBox />
      <PokemonList />
      <div className="footer">
        Site powered by
        {' '}
        <a href="https://www.npmjs.com/package/@erezushi/pokemon-randomizer">this</a>
        {' '}
        NPM library
      </div>
    </div>
  );
}

export default App;
