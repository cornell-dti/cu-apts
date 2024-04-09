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
import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const expandArrow = (direction: boolean) => {
  return (
    <div style={{ paddingLeft: '10px', transform: direction ? 'rotate(180deg)' : 'none' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="12"
        viewBox="0 0 20 12"
        fill="none"
      >
        <path d="M1 1L10 10L19 1" stroke="black" strokeWidth="2" />
      </svg>
    </div>
  );
};

type MenuElement = {
  item: string;
  callback: () => void;
};

type Props = {
  menuItems: MenuElement[];
  isMobile?: boolean;
};

const useStyles = makeStyles({
  button: {
    minWidth: '64px',
    backgroundColor: '#e8e8e8',
    borderColor: '#e8e8e8',
  },
});

export default function DropDown({ menuItems, isMobile }: Props) {
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
        style={{
          textTransform: 'none',
          fontSize: '22px',
          lineHeight: 'normal',
          fontWeight: 'normal',
          height: '51px',
          paddingLeft: '18px',
          paddingRight: '18px',
          borderRadius: '10px',
          backgroundColor: '#E8E8E8',
          scale: isMobile ? '0.75' : '1',
        }}
      >
        {selected}
        {expandArrow(open)}
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
              {item}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}
