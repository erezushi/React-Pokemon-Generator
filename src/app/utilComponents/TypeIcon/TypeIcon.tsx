import { PokemonType } from '@erezushi/pokemon-randomizer';
import { Tooltip } from '@mui/material';
import Image from 'next/image';
import _ from 'lodash';

import './TypeIcon.css';

interface ITypeIconProps {
  type: PokemonType;
}

const TypeIcon = (props: ITypeIconProps) => {
  const { type } = props;

  return (
    <Tooltip arrow placement="top" title={_.capitalize(type)}>
      <Image
        alt={`${type} type icon`}
        className={`icon ${type}`}
        height={15}
        src={`/assets/${type.toLowerCase()}.svg`}
        width={15}
      ></Image>
    </Tooltip>
  );
};

export default TypeIcon;
