import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  AppHeader, CustomList, OptionsBox, PokemonList,
} from './components';

import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <OptionsBox />
        <PokemonList />
      </>
    ),
  },
  {
    path: '/list',
    element: <CustomList />,
  },
]);

const App = () => (
  <div className="app">
    <AppHeader />
    <RouterProvider router={router} />
    <div className="footer">
      Site made by Erez Bracha, aka&nbsp;
      <a href="https://linktr.ee/erezushi">PokéErez</a>
      , powered by&nbsp;
      <a href="https://www.npmjs.com/package/@erezushi/pokemon-randomizer">this</a>
      &nbsp;NPM library
    </div>
  </div>
);

export default App;
