import { Types } from '@erezushi/pokemon-randomizer';
import { Tooltip } from '@mui/material';
import _ from 'lodash';
import React from 'react';

import {
  BugIcon,
  DarkIcon,
  DragonIcon,
  ElecticIcon,
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
  WaterIcon,
} from '../../assets';

import './TypeIcon.css';

const renderMap = {
  bug: () => (
    <BugIcon />
  ),
  dark: () => (
    <DarkIcon />
  ),
  dragon: () => (
    <DragonIcon />
  ),
  electric: () => (
    <ElecticIcon />
  ),
  fairy: () => (
    <FairyIcon />
  ),
  fighting: () => (
    <FightingIcon />
  ),
  fire: () => (
    <FireIcon />
  ),
  flying: () => (
    <FlyingIcon />
  ),
  ghost: () => (
    <GhostIcon />
  ),
  grass: () => (
    <GrassIcon />
  ),
  ground: () => (
    <GroundIcon />
  ),
  ice: () => (
    <IceIcon />
  ),
  normal: () => (
    <NormalIcon />
  ),
  poison: () => (
    <PoisonIcon />
  ),
  psychic: () => (
    <PsychicIcon />
  ),
  rock: () => (
    <RockIcon />
  ),
  steel: () => (
    <SteelIcon />
  ),
  water: () => (
    <WaterIcon />
  ),
};

interface ITypeIconProps {
    type: Types;
}

const TypeIcon = (props: ITypeIconProps) => {
  const { type } = props;

  return (
    <Tooltip
      arrow
      placement="top"
      title={_.capitalize(type)}
    >
      <div className={`icon ${type}`}>
        { renderMap[type]() }
      </div>
    </Tooltip>
  );
};

export default TypeIcon;
