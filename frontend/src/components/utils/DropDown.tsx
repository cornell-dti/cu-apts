/**
 * DropDown Component
 *
 * @remarks
 * A dropdown component that displays a button and a menu with selectable items.
 * The component uses Material-UI components for consistent styling.
 *
 * @component
 * @example
 * ```typescript
 * const menuItems = [
 *   { item: 'Price', callback: () => setSortBy('avgPrice')},
 *   { item: 'Rating', callback: () => setSortBy('avgRating')},
 *   { item: 'Date Added', callback: () => setSortBy('id')},
 * ];
 *
 * function App() {
 *   return (
 *     <DropDown menuItems={menuItems} />
 *   );
 * }
 *```
 * @param {Object} props - The props of the component.
 * @param {MenuElement[]} props.menuItems - An array of menu items, each containing an item name and a callback function.
 * @returns {JSX.Element} The rendered dropdown component.
 */
import React, { useState, useEffect } from 'react';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  RadioButtonChecked,
  RadioButtonUnchecked,
  ArrowDropDown,
  ArrowDropUp,
} from '@material-ui/icons';
import SvgIcon from '@material-ui/core/SvgIcon';

type MenuElement = {
  item: string;
  callback: () => void;
};

type Props = {
  menuItems: MenuElement[];
};

const useStyles = makeStyles({
  button: {
    minWidth: '64px',
    backgroundColor: '#e8e8e8',
    borderColor: '#e8e8e8',
  },
});

export default function DropDown({ menuItems }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<string>(menuItems[0].item || '-');
  const { button } = useStyles();

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className={button}
      >
        {selected}
        <SvgIcon component={open ? ArrowDropUp : ArrowDropDown} />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {menuItems.map((menuItem) => {
          const { item, callback } = menuItem;
          return (
            <MenuItem
              key={item}
              onClick={() => {
                setSelected(item);
                handleClose();
                callback();
              }}
            >
              <SvgIcon
                component={menuItem.item === selected ? RadioButtonChecked : RadioButtonUnchecked}
                fontSize="small"
                style={{ paddingRight: '1rem' }}
              />
              {item}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}
