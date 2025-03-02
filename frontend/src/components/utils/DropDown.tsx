import React, { useState } from 'react';
import { Button, Menu, MenuItem, SvgIcon } from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { makeStyles } from '@material-ui/styles';
import ArrowDownSrc from '../../assets/dropdown-arrow-down.svg';

const expandArrow = (direction: boolean) => {
  return (
    <div
      style={{
        padding: '0 0 0 10px',
        transform: direction ? 'scaleY(-1)' : 'none',
        transition: 'all 0.5s ease',
      }}
    >
      <img src={ArrowDownSrc} alt="⬇" height="10" />
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
  defaultValue?: string;
  className?: string;
  icon?: boolean;
};

const useStyles = makeStyles({
  button: {
    borderColor: '#E8E8E8',
    textTransform: 'none',
    fontSize: '18px',
    lineHeight: 'normal',
    fontWeight: 'normal',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: '#E8E8E8',
    scale: '1',
    whiteSpace: 'nowrap',
  },
});

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

export default function DropDown({ menuItems, isMobile, defaultValue, className, icon }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<string>(defaultValue ? defaultValue : menuItems[0].item);
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
        className={className || button}
      >
        {selected}
        {icon === undefined
          ? expandArrow(open)
          : icon === true && <SvgIcon component={ArrowDropDownIcon} />}
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
