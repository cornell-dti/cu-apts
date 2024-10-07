import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import React, { useState } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles(() => ({
  reviewOptionMenu: {
    borderRadius: '12px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
  reviewOptionMenuItem: {
    padding: '0px 16px',
  },
  reviewOptionMenuItemIcon: {
    minWidth: '30px',
  },
}));

type OptionMenuElement = {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
};

interface OptionMenuProps {
  options: OptionMenuElement[];
}

/**
 * OptionMenu component renders a button that, when clicked, displays a menu with a list of options.
 * Each option consists of an icon, text, and an onClick handler.
 *
 * @component
 *
 * @param {OptionMenuProps} props - The properties for the OptionMenu component.
 * @param {OptionMenuElement[]} props.options - An array of option elements to be displayed in the menu.
 *
 * @typedef {Object} OptionMenuElement
 * @property {React.ReactNode} icon - The icon to be displayed for the menu item.
 * @property {string} text - The text to be displayed for the menu item.
 * @property {() => void} onClick - The function to be called when the menu item is clicked.
 *
 * @typedef {Object} OptionMenuProps
 * @property {OptionMenuElement[]} options - An array of option elements to be displayed in the menu.
 *
 * @returns {JSX.Element} The rendered OptionMenu component.
 */
export default function OptionMenu({ options }: OptionMenuProps) {
  const { reviewOptionMenu, reviewOptionMenuItem, reviewOptionMenuItemIcon } = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div>
      <IconButton
        id="icon-button"
        onClick={handleClick}
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        className={reviewOptionMenu}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        PaperProps={{ style: { borderRadius: '12px' } }}
        MenuListProps={{
          'aria-labelledby': 'icon-button',
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              option.onClick();
              handleClose();
            }}
            className={reviewOptionMenuItem}
          >
            <ListItemIcon className={reviewOptionMenuItemIcon}>{option.icon}</ListItemIcon>
            <ListItemText>{option.text}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
