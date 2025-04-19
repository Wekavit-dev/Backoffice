/* eslint-disable prettier/prettier */
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
export default function ResponsiveDialog({ open, handleClose, handleSubmit, text, description, header, load }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [email, setEmail] = React.useState('');

    return (
        <React.Fragment>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (event) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries(formData.entries());
                            const email = formJson.email;
                            handleSubmit(email);
                            console.log(email);
                            handleClose();
                        }
                    }
                }}
            >
                <DialogTitle fontSize="1rem" id="responsive-dialog-title" >{header}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {description}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name={text}
                        label={text}
                        type="email"
                        fullWidth
                        variant="standard"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={handleClose}>Annuler</Button>
                    {load ? (<CircularProgress size="1.5rem" />) : (<Button type="submit" onClick={() => handleSubmit(email)} >Se connecter</Button>)}

                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
