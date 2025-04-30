import React, { useState } from 'react';
import { Button, Menu, MenuItem, SvgIcon, Typography } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { makeStyles } from '@material-ui/styles';
import { ReactComponent as SortHamburgerIcon } from '../../assets/sort-icon.svg';

type MenuElement = {
  item: string;
  callback: () => void;
};

type Props = {
  menuItems: MenuElement[];
  isMobile?: boolean;
  defaultValue?: string;
  className?: string;
  icon?: boolean;
};

const useStyles = makeStyles({
  dropdownContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  dropdownButton: {
    display: 'flex',
    paddingLeft: '12px',
    paddingRight: '12px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    border: '1px solid #E8E8E8',
    borderRadius: '8px',
  },
  labelText: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: '28px',
    transition: 'color 0.2s',
    textTransform: 'none',
  },
  menuItem: {
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
});

const sortHamburger = (color: string) => {
  return (
    <div
      style={{
        marginRight: '10px',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <SortHamburgerIcon style={{ color: color }} />
    </div>
  );
};

/**
 * DropDown – A dropdown component that displays a button and a menu with selectable items.
 *
 * @remarks
 * The component uses Material-UI components for consistent styling. It allows users to select an item from a dropdown menu, triggering a callback function.
 *
 * @param {MenuElement[]} props.menuItems – An array of menu items, each containing an item name and a callback function.
 * @param {boolean} [props.isMobile] – Optional flag to indicate if the component is being used on a mobile device.
 * @param {string} [props.defaultValue] – Optional default value to be displayed on the button.
 * @param {string} [props.className] – Optional custom class name for the button.
 * @param {boolean} [props.icon] – Optional flag to display an icon on the button.
 *
 * @return {JSX.Element} – The rendered dropdown component.
 */

export default function SortDropDown({
  menuItems,
  isMobile,
  defaultValue,
  className,
  icon,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<string>(defaultValue ? defaultValue : menuItems[0].item);
  const { dropdownContainer, dropdownButton, labelText, menuItem } = useStyles();

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const color = open ? '#000' : '#898989';

  return (
    <div className={dropdownContainer}>
      <Button
        id="basic-button"
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        className={dropdownButton}
        disableRipple
        style={{
          background: open ? '#E8E8E8' : '#fff',
        }}
      >
        {sortHamburger(color)}
        <Typography className={labelText} style={{ color }}>
          Sort
        </Typography>
      </Button>
      <Menu
        id="basic-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        PaperProps={{
          elevation: 0,
          style: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            marginTop: 60,
            marginLeft: -16,
            borderRadius: '10px',
            boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.10)',
          },
        }}
      >
        {menuItems.map((item) => {
          const { item: itemName, callback } = item;
          return (
            <MenuItem
              key={itemName}
              onClick={() => {
                setSelected(itemName);
                handleClose();
                callback();
              }}
              className={menuItem}
            >
              {itemName}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}
