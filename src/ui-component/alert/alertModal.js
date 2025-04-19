/* eslint-disable prettier/prettier */
import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function CustomizableAlert({ vertical, horizontal, message, open, handleClose, status }) {

    return (
        <div>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical, horizontal }}
                key={vertical + horizontal}
            >
                <Alert
                    onClose={handleClose}
                    severity={status}
                    variant="filled"
                    sx={{ width: '100%', color: 'white' }}
                >
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
}