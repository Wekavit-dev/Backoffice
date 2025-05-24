/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from 'react';

// material-ui
import { Button, Grid } from '@mui/material';
import { IP_ADD } from 'api/utils/address';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import { gridSpacing } from 'store/constant';
import { AppContext } from 'AppContext';
import { WithdrawAPI, DepositsAPI, HistoryAPI, UsersAPI } from 'api';
import TodayWithdrawalsCard from './TodayWithdrawals';
import { useSnackbar } from 'notistack';
// import { SpinnerLoader } from 'views/ui-elements/Loaders';

// ==============================|| DEFAULT DASHBOARD ||============================== //
// const socket = io('http://192.168.20.74:8000/api/v0');
const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const [todayDeposits, setTodayDeposits] = useState(0);
  const [todayWithdraws, setTodayWithdraws] = useState(0);
  const [history, setHistory] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [todayUsers, setTodayUsers] = useState(0);
  const [total, setTotal] = useState(10);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);

    UsersAPI.getAllTodayUsers(globalState?.key)
      .then((res) => {
        if (res.data) {
          console.log(res);
          let response = res.data;
          let status = res.status;
          if (status == (200 || 201)) {
            setTodayUsers(response.total);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        enqueueSnackbar(err.response.data.message, { variant: 'error', autoHideDuration: 4000 });
        setLoading(false);
        console.log('error', err);
      });

    DepositsAPI.getAllTodayDeposits(globalState?.key)
      .then((res) => {
        if (res.data) {
          console.log(res);
          let response = res.data;
          let status = res.status;
          if (status == (200 || 201)) {
            setTodayDeposits(response.todayDepositsCount);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        enqueueSnackbar(err.response.data.message, { variant: 'error', autoHideDuration: 4000 });
        setLoading(false);
        console.log('error', err);
      });
    WithdrawAPI.getAllTodayWithdrawls(globalState?.key)
      .then((res) => {
        if (res.data) {
          console.log(res);
          let response = res.data;
          let status = res.status;
          if (status == (200 || 201)) {
            setTodayWithdraws(response.total);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        enqueueSnackbar(err.response.data.message, { variant: 'error', autoHideDuration: 4000 });
        setLoading(false);
        console.log('error', err);
      });
    HistoryAPI.getAgentHistory({ total }, globalState?.key)
      .then((res) => {
        if (res.data) {
          console.log('getAgentHistory', res);
          let response = res.data;
          let status = res.status;
          if (status == (200 || 201)) {
            setHistory(response.data);
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        enqueueSnackbar(err.response.data.message, { variant: 'error', autoHideDuration: 4000 });
        setLoading(false);
        console.log('error', err);
      });
  }, []);

  console.log('stream', globalState);
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {/* <Button onClick={joinSession}>Join Session</Button> */}
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} todayUsers={todayUsers} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <TotalOrderLineChartCard isLoading={isLoading} todayDeposits={todayDeposits} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <TodayWithdrawalsCard isLoading={isLoading} todayWithdraws={todayWithdraws} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} md={8}>
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          <Grid item xs={12} md={4}>
            <PopularCard isLoading={isLoading} userData={globalState} history={history} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
