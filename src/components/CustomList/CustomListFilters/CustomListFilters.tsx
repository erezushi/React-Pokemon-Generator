import React, { useCallback } from 'react';
import DownloadIcon from '@mui/icons-material/DownloadRounded';
import UploadIcon from '@mui/icons-material/UploadRounded';
import {
  Paper,
  Typography,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import _ from 'lodash';

import { CustomCheckbox } from '../../../utilComponents';
import { DEFAULT_FILTERS } from '../../../utils';
import { ICustomListFilters } from '../../../utils/Types';

import './CustomListFilters.css';

interface ICustomListFiltersProps {
    filters: ICustomListFilters;
    setFilters: React.Dispatch<React.SetStateAction<ICustomListFilters>>;
    fetchGenerations: () => void;
    saveList: () => void;
    exportList: () => void;
    importList: () => void;
}

const CustomListFilters = (props: ICustomListFiltersProps) => {
  const {
    filters, setFilters, fetchGenerations, saveList, exportList, importList,
  } = props;
  const { generations, types, searchTerm } = filters;

  const genClicked = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFilters((prevFilters) => {
      const filtersCopy = { ...prevFilters };

      filtersCopy.generations = {
        ...filtersCopy.generations,
        [name]: checked,
      };

      return filtersCopy;
    });
  }, [setFilters]);

  const typeClicked = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setFilters((prevFilters) => {
      const filtersCopy = { ...prevFilters };

      filtersCopy.types = {
        ...filtersCopy.types,
        [name]: checked,
      };

      return filtersCopy;
    });
  }, [setFilters]);

  const changeSearchTerm = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prevFilters) => {
      const filtersCopy = { ...prevFilters };

      filtersCopy.searchTerm = event.target.value;

      return filtersCopy;
    });
  }, [setFilters]);

  const resetClick = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    fetchGenerations();
  }, [fetchGenerations, setFilters]);

  return (
    <Paper className="list-filter-container">
      <>
        <Typography component="h2" variant="h5">
          Filters
        </Typography>
        <FormControl className="options-control">
          <TextField
            className="search-filter-input"
            label="search"
            onChange={changeSearchTerm}
            value={searchTerm}
            variant="outlined"
          />
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Generations</FormHelperText>
          <FormGroup row>
            {Object.entries(generations).map(([gen, isSelected]) => (
              <FormControlLabel
                key={gen}
                className="gen-checkbox"
                control={(
                  <CustomCheckbox
                    checked={isSelected}
                    name={gen}
                    onChange={genClicked}
                  />
                )}
                label={gen}
                labelPlacement="bottom"
              />
            ))}
          </FormGroup>
        </FormControl>
        <FormControl className="options-control">
          <FormHelperText>Types</FormHelperText>
          <FormGroup row>
            {Object.entries(types).slice(0, 9).map(([type, isSelected]) => (
              <FormControlLabel
                key={type}
                className="gen-checkbox"
                control={(
                  <CustomCheckbox
                    checked={isSelected}
                    name={type}
                    onChange={typeClicked}
                  />
                  )}
                label={_.startCase(type)}
                labelPlacement="end"
              />
            ))}
          </FormGroup>
          <FormGroup row>
            {Object.entries(types).slice(9).map(([type, isSelected]) => (
              <FormControlLabel
                key={type}
                className="gen-checkbox"
                control={(
                  <CustomCheckbox
                    checked={isSelected}
                    name={type}
                    onChange={typeClicked}
                  />
                  )}
                label={_.startCase(type)}
                labelPlacement="end"
              />
            ))}
          </FormGroup>
        </FormControl>
        <div className="filters-actions">
          <Button
            className="filters-button"
            onClick={saveList}
            variant="contained"
          >
            Save and go back
          </Button>
          <Button
            className="filters-button"
            color="error"
            onClick={resetClick}
          >
            Clear Filters
          </Button>
          <IconButton onClick={exportList}>
            <Tooltip title="Export selection">
              <DownloadIcon />
            </Tooltip>
          </IconButton>
          <IconButton onClick={importList}>
            <Tooltip title="Import selection">
              <UploadIcon />
            </Tooltip>
          </IconButton>
        </div>
      </>
    </Paper>
  );
};

export default CustomListFilters;
