import React from 'react';
import { Button, Menu, MenuItem } from '@material-ui/core';

type MenuElement = {
  item: string;
  callback: () => void;
};

type Props = {
  label: string;
  menuItems: MenuElement[];
};

export default function BasicMenu({ label, menuItems }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
      >
        {label}
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
              onClick={() => {
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
