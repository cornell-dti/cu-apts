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

export default function BasicMenu({ menuItems }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<string>(menuItems[0].item || '-');
  const { button } = useStyles();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
