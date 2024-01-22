import React, { useCallback, useState, useEffect } from 'react';
import {
  Button, Card, CardContent, CardHeader, Modal, FormControlLabel,
} from '@mui/material';
import _ from 'lodash';

import './PokedexSelectionModal.css';
import { CustomCheckbox } from '../../utilComponents';

type PokedexObject = {
  games: string;
  apiName: string;
  DLCs?: Record<string, string>;
};

const pokedexes: Record<string, PokedexObject[]> = {
  Kanto: [
    {
      games: 'Red / Green / Blue / Yellow / FireRed / LeafGreen',
      apiName: 'kanto',
    },
    {
      games: "Let's Go, Pikachu! / Let's Go, Eevee!",
      apiName: 'letsgo-kanto',
    },
  ],
  Johto: [
    {
      games: 'Gold / Silver / Crystal',
      apiName: 'original-johto',
    },
    {
      games: 'HeartGold / SoulSilver',
      apiName: 'updated-johto',
    },
  ],
  Hoenn: [
    {
      games: 'Ruby / Sapphire / Emerald',
      apiName: 'hoenn',
    },
    {
      games: 'Omega Ruby / Alpha Sapphire',
      apiName: 'updated-hoenn',
    },
  ],
  Sinnoh: [
    {
      games: 'Diamond / Pearl / Brilliant Diamond / Shining Pearl',
      apiName: 'original-sinnoh',
    },
    {
      games: 'Platinum',
      apiName: 'extended-sinnoh',
    },
  ],
  Unova: [
    {
      games: 'Black / White',
      apiName: 'original-unova',
    },
    {
      games: 'Black 2 / White 2',
      apiName: 'updated-unova',
    },
  ],
  Kalos: [
    {
      games: 'X / Y',
      apiName: 'kalos-central kalos-coastal kalos-mountain',
    },
  ],
  Alola: [
    {
      games: 'Sun / Moon',
      apiName: 'original-alola',
    },
    {
      games: 'Ultra Sun / Ultra Moon',
      apiName: 'updated-alola',
    },
  ],
  Galar: [
    {
      games: 'Sword / Shield',
      apiName: 'galar',
      DLCs: {
        'isle-of-armor': 'isle-of-armor',
        'crown-tundra': 'crown-tundra',
      },
    },
  ],
  Hisui: [
    {
      games: 'Legends: Arceus',
      apiName: 'hisui',
    },
  ],
  Paldea: [
    {
      games: 'Scarlet / Violet',
      apiName: 'paldea',
      DLCs: {
        'teal-mask': 'kitakami',
        'indigo-disk': 'blueberry',
      },
    },
  ],
};

interface IPokedexSelectionModalProps {
  isOpen: boolean;
  selectPokedex: (pokedex: string) => void;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PokedexSelectionModal = (props: IPokedexSelectionModalProps) => {
  const { isOpen, selectPokedex, setOpen } = props;

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDLCs, setSelectedDLCs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedRegion('');
      setSelectedDLCs([]);
    }
  }, [isOpen]);

  const handleModalClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleRegionButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const region = event.currentTarget.name;
      const regionPokedexes = pokedexes[region];

      if (regionPokedexes.length === 1 && !regionPokedexes[0].DLCs) {
        selectPokedex(regionPokedexes[0].apiName);
      } else {
        setSelectedRegion(region);
      }
    },
    [selectPokedex],
  );

  const handleGameButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      selectPokedex(`${event.currentTarget.name} ${selectedDLCs.join(' ')}`.trim());
    },
    [selectPokedex, selectedDLCs],
  );

  const handleDLCCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = event.currentTarget;

      if (checked) {
        setSelectedDLCs((prevSelectedDLCs) => [...prevSelectedDLCs, name]);
      } else {
        setSelectedDLCs((prevSelectedDLCs) => prevSelectedDLCs.filter((dlc) => dlc !== name));
      }
    },
    [],
  );

  const handleBackButtonClick = useCallback(() => {
    setSelectedRegion('');
    setSelectedDLCs([]);
  }, []);

  return (
    <Modal className="pokedex-modal" onClose={handleModalClose} open={isOpen}>
      <Card className="pokedex-card">
        <CardHeader title="Select Regional Pokédex" />
        <CardContent className="pokedex-content">
          {selectedRegion ? (
            <>
              <strong>{`Select version of ${selectedRegion} regional Pokédex`}</strong>
              <div className="pokedex-button-grid">
                {pokedexes[selectedRegion].map((pokedex) => (
                  <div
                    key={pokedex.apiName}
                    className="pokedex-button-container"
                  >
                    <Button
                      className="pokedex-button game"
                      name={pokedex.apiName}
                      onClick={handleGameButtonClick}
                      variant="outlined"
                    >
                      {pokedex.games}
                    </Button>
                    {pokedex.DLCs && Object.entries(pokedex.DLCs).map(([dlcName, pokedexName]) => (
                      <FormControlLabel
                        key={dlcName}
                        control={(
                          <CustomCheckbox
                            checked={selectedDLCs.includes(pokedexName)}
                            name={pokedexName}
                            onChange={handleDLCCheckboxChange}
                          />
                        )}
                        label={`Include the ${_.startCase(dlcName)} DLC`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <Button
                className="pokedex-button"
                onClick={handleBackButtonClick}
                variant="contained"
              >
                Back
              </Button>
            </>
          ) : (
            <>
              <strong>Select Region</strong>
              <div className="pokedex-button-grid">
                {Object.keys(pokedexes).map((region) => (
                  <Button
                    key={region}
                    className="pokedex-button region"
                    name={region}
                    onClick={handleRegionButtonClick}
                    variant="outlined"
                  >
                    {region}
                  </Button>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Modal>
  );
};

export default PokedexSelectionModal;
