import React from 'react';
import { PokemonType } from '@erezushi/pokemon-randomizer';
import { Tooltip } from '@mui/material';
import _ from 'lodash';

import {
  BugIcon,
  DarkIcon,
  DragonIcon,
  ElectricIcon,
  FairyIcon,
  FightingIcon,
  FireIcon,
  FlyingIcon,
  GhostIcon,
  GrassIcon,
  GroundIcon,
  IceIcon,
  NormalIcon,
  PoisonIcon,
  PsychicIcon,
  RockIcon,
  SteelIcon,
  WaterIcon
} from '../../assets';

import './TypeIcon.css';

const renderMap = {
  bug: () => <BugIcon className="icon bug" />,
  dark: () => <DarkIcon className="icon dark" />,
  dragon: () => <DragonIcon className="icon dragon" />,
  electric: () => <ElectricIcon className="icon electric" />,
  fairy: () => <FairyIcon className="icon fairy" />,
  fighting: () => <FightingIcon className="icon fighting" />,
  fire: () => <FireIcon className="icon fire" />,
  flying: () => <FlyingIcon className="icon flying" />,
  ghost: () => <GhostIcon className="icon ghost" />,
  grass: () => <GrassIcon className="icon grass" />,
  ground: () => <GroundIcon className="icon ground" />,
  ice: () => <IceIcon className="icon ice" />,
  normal: () => <NormalIcon className="icon normal" />,
  poison: () => <PoisonIcon className="icon poison" />,
  psychic: () => <PsychicIcon className="icon psychic" />,
  rock: () => <RockIcon className="icon rock" />,
  steel: () => <SteelIcon className="icon steel" />,
  water: () => <WaterIcon className="icon water" />
};

interface ITypeIconProps {
  type: PokemonType;
}

const TypeIcon = (props: ITypeIconProps) => {
  const { type } = props;

  return (
    <Tooltip arrow placement="top" title={_.capitalize(type)}>
      {renderMap[type]()}
    </Tooltip>
  );
};

export default TypeIcon;
