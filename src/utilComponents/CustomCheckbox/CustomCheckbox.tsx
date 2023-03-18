import React from 'react';
import CheckBox from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBox from '@mui/icons-material/IndeterminateCheckBox';
import { Checkbox, CheckboxProps } from '@mui/material';

const CustomCheckbox = ({
  checked,
  indeterminate,
  name,
  onChange,
}: CheckboxProps) => (
  <Checkbox
    checked={checked}
    checkedIcon={<CheckBox fontSize="small" style={{ color: 'red' }} />}
    icon={<CheckBoxOutlineBlank fontSize="small" />}
    indeterminate={indeterminate}
    indeterminateIcon={<IndeterminateCheckBox color="action" fontSize="small" />}
    name={name}
    onChange={onChange}
  />
);

export default CustomCheckbox;
