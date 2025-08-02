import * as React from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Box } from '@mui/system';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

export default function CustomDeleteIconChips({data, interest}) {
  const handleClick = () => {
    console.info('You clicked the Chip.');
  };

  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };

  return (
    <Stack direction="row" spacing={2}>
        {Array.isArray(data) ? data.map((item, index)=> <Chip
        label={`${item.amount} ${item.currency}`}
        key={index}
        onClick={handleClick}
        color="info"
        onDelete={handleDelete}
        deleteIcon={<ReceiptIcon />}
        sx={{ p:3, minWidth: '260px' }}
      />):
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', backgroundColor: '', gap: 1.5 }}>
        <Chip
        label={`${interest}`}
        onClick={handleClick}
        color="warning"
        onDelete={handleDelete}
        deleteIcon={<AddShoppingCartIcon />}
        sx={{ p:3, minWidth: '260px' }}
      />
        <Chip
        label={`${data}`}
        onClick={handleClick}
        color="secondary"
        onDelete={handleDelete}
        deleteIcon={<ReceiptIcon />}
        sx={{ p:3, minWidth: '260px' }}
      />
      
      </Box> 
      }
    </Stack>
  );
}
