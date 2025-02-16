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

/**
 * DropDownWithLabel – A dropdown component with a label.
 *
 * @remarks
 * This component renders a label alongside a dropdown menu. It is designed to be responsive and can adjust its layout based on whether it is displayed on a mobile device.
 *
 * @param {string} props.label – The label for the dropdown.
 * @param {MenuElement[]} props.menuItems – An array of menu items, each containing an item name and a callback function.
 * @param {React.CSSProperties} [props.labelStyle] – The style of the label.
 * @param {boolean} props.isMobile – Whether the dropdown is being displayed on a mobile device.
 *
 * @return {JSX.Element} – The rendered dropdown component.
 */

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
