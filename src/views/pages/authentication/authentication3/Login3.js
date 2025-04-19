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

// assets

// ================================|| AUTH3 - LOGIN ||================================ //

const Login = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const handleVerification = (data) => {
    AuthentificationAPI.signIn(data)
      .then((res) => {
        if (res.data) {
          let status = res.status;
          if (status == (200 || 201)) {
            // Assuming verification is successful
            setGlobalState({ ...res.data.data, key: res.data.key });
            navigate('/wekavit/Dashboard/Default');
          }
        } else {
          const response = res.response;
          alertModal(response.status, response.data.message);
          setLoad(true);
        }
      })
      .catch((err) => {
        console.log(err);
        alertModal(500, err);
      });
  };

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
                    <AuthLogin handleVerification={handleVerification} />
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
    </AuthWrapper1>
  );
};

export default Login;
