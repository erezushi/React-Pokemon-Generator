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
    </div>
  );
}

export default App;
