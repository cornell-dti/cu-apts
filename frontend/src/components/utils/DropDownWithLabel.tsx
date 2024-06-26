/**
 * A dropdown component with a label.
 *
 * @component
 *
 * @param {string} label - The label for the dropdown.
 * @param {MenuElement[]} menuItems - An array of menu items, each containing an item name and a callback function.
 * @param {React.CSSProperties} [labelStyle] - The style of the label.
 * @param {boolean} isMobile - Whether the dropdown is being displayed on a mobile device.
 *
 * @returns {JSX.Element} The rendered dropdown component.
 *
 * @example
 * // Usage:
 * const menuItems = [
 *   { item: 'Item 1', callback: () => console.log('Item 1 selected') },
 *   { item: 'Item 2', callback: () => console.log('Item 2 selected') },
 *   { item: 'Item 3', callback: () => console.log('Item 3 selected') },
 * ];
 *
 * <DropDownWithLabel label="Select an item" menuItems={menuItems} isMobile={true} />
 */
import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import DropDown from './DropDown';

type MenuElement = {
  item: string;
  callback: () => void;
};

interface DropDownWithLabelProps {
  label: string;
  menuItems: MenuElement[];
  labelStyle?: React.CSSProperties;
  isMobile: boolean;
}

const DropDownWithLabel: React.FC<DropDownWithLabelProps> = ({
  label,
  menuItems,
  labelStyle,
  isMobile,
}) => {
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      wrap="nowrap"
      spacing={0}
    >
      <Grid item>
        <Typography
          variant="body1"
          style={{
            fontSize: '18px',
            paddingRight: '10px',
            whiteSpace: 'nowrap',
            ...labelStyle,
          }}
        >
          {label}
        </Typography>
      </Grid>
      <Grid item>
        <DropDown menuItems={menuItems} isMobile={isMobile} />
      </Grid>
    </Grid>
  );
};

export default DropDownWithLabel;
