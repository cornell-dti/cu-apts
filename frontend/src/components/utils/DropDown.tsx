import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

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
  },
});

export default function BasicMenu({ menuItems }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<string>('Recent');
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
