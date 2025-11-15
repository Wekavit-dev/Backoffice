import { Link, useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, Grid, Stack, Typography, useMediaQuery } from '@mui/material';

// project imports
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthLogin from '../auth-forms/AuthLogin';
// import Logo from 'ui-component/Logo';
import logo from 'ui-component/logo.png';
import AuthFooter from 'ui-component/cards/AuthFooter';
import { AuthentificationAPI } from 'api';
import { AppContext } from 'AppContext';
import ResponsiveDialog from 'ui-component/modal/reponsiveFormModal';
import CustomizableAlert from 'ui-component/alert/alertModal';
import { useSnackbar } from 'notistack';

// assets

// ================================|| AUTH3 - LOGIN ||================================ //

const Login = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const navigate = useNavigate();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [load, setLoad] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const handleOpen = () => {
    setOpen(true);
  };
  const handleVerification = (data) => {
    setLoad(true);
    // enqueueSnackbar('Vérification en cours', { variant: 'info', autoHideDuration: 4000 });
    AuthentificationAPI.signIn(data)
      .then((res) => {
        if (res.data) {
          console.log(res.data);

          let status = res.status;
          if (status == (200 || 201)) {
            // Assuming verification is successful
            enqueueSnackbar(res.data.message, { variant: 'info', autoHideDuration: 4000 });
            setLoad(false);
            setGlobalState({ key: res.data.key, message: res.data.message });
            // setTimeout(() => {
            //   handleOpenAltert();
            // }, 0);
            setEmail(data.email);
            handleOpen();
            setLoad(false);
          }
        } else {
          const response = res.response;
          alertModal(response.status, response.data.message);
          enqueueSnackbar(response.data.message, { variant: 'info', autoHideDuration: 4000 });
          setLoad(false);
        }
      })
      .catch((err, data) => {
        console.log('err111', data);
        enqueueSnackbar(err, { variant: 'error', autoHideDuration: 4000 });
        setLoad(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseAltert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenAlert(false);
  };

  const handleSubmit = (code) => {
    // Handle the email submission here
    setLoad(true);
    const data = { secretKey: code, email: email };
    AuthentificationAPI.VerifyCode(data, globalState?.key)
      .then((res) => {
        console.log('res000', res);
        if (res.data) {
          let status = res.status;
          if (status == (200 || 201)) {
            // Assuming verification is successful
            setLoad(false);
            setGlobalState({ ...res.data.data, key: res.data.key });
            navigate('/wekavit/Dashboard/Default');
          }
        } else {
          const response = res.response;
          alertModal(response.status, response.data.message);
          setLoad(false);
        }
      })
      .catch((err) => {
        enqueueSnackbar(err, { variant: 'error', autoHideDuration: 4000 });
        setLoad(false);
      });
    console.log('Email submitted:', email);
  };
  console.log('globalState', load);
  return (
    <AuthWrapper1>
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid item sx={{ mb: 3 }}>
                    <Link to="#">
                      <image src={logo} alt="logo" />
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center">
                      <Grid item>
                        <Stack alignItems="center" justifyContent="center" spacing={1}>
                          <Typography color={theme.palette.secondary.main} gutterBottom variant={matchDownSM ? 'h3' : 'h2'}>
                            Salut, bon retour
                          </Typography>
                          <Typography variant="caption" fontSize="15px" textAlign={matchDownSM ? 'center' : 'inherit'}>
                            Entrez vos identifiants pour continuer
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <AuthLogin handleVerification={handleVerification} load={load} />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item container direction="column" alignItems="center" xs={12}>
                      <Typography component={Link} to="/pages/register/register3" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                        Don&apos;t have an account?
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid>
      </Grid>
      <ResponsiveDialog
        text="Code secret"
        description="Entrez votre code secret réçu sur votre mail, pour vous connecter"
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        header="Vérification du code secret"
        load={load}
      />
      <CustomizableAlert
        vertical="top"
        horizontal="right"
        message={globalState.message}
        open={openAlert}
        handleClose={handleCloseAltert}
        status="success"
      />
    </AuthWrapper1>
  );
};

export default Login;
