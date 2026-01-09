import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ProfileIcon from '@mui/icons-material/Person';

export default function CustomBottomNavigation() {
  const [value, setValue] = React.useState(0);

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        boxShadow: '0px -1px 4px rgba(0,0,0,0.2)',
        zIndex: 1000
      }}
    >
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Courses" icon={<SchoolIcon />} />
      <BottomNavigationAction label="Wallet" icon={<WalletIcon />} />
      <BottomNavigationAction label="Profile" icon={<ProfileIcon />} />
    </BottomNavigation>
  );
}