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
import { WithdrawAPI, DepositsAPI, HistoryAPI } from 'api';
import { io } from 'socket.io-client';
// import { SpinnerLoader } from 'views/ui-elements/Loaders';

// ==============================|| DEFAULT DASHBOARD ||============================== //
// const socket = io('http://192.168.20.74:8000/api/v0');
const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const [deposits, setDeposits] = useState();
  const [withdraws, setWithdraws] = useState();
  const [history, setHistory] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const agentId = globalState?._id;

  // useEffect(() => {
  //   setLoading(false);
  //   const data = { idCountry: globalState?.idPays };
  //   WithdrawAPI.getWithdrawsByCountry(data, globalState?.key)
  //     .then((res) => {
  //       if (res.data) {
  //         let response = res.data;
  //         let status = res.status;
  //         if (status == (200 || 201)) {
  //           const pendingWithdraws = response.data.filter((item) => item.etat === 'pending');
  //           // console.log(pendingWithdraws);
  //           setWithdraws(pendingWithdraws);
  //         }
  //       } else {
  //         const response = res.response;
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  //   DepositsAPI.getAllDepositsByCountry(data, globalState?.key)
  //     .then((res) => {
  //       if (res.data) {
  //         let response = res.data;
  //         let status = res.status;
  //         if (status == (200 || 201)) {
  //           const pendindeposits = response.data.filter((item) => item.etat === 'pending');
  //           setDeposits(pendindeposits);

  //           // console.log(pendindeposits);
  //         }
  //       } else {
  //         const response = res.response;
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  //   const total = { total: 10 };
  //   HistoryAPI.getAgentHistory(total, globalState?.key)
  //     .then((res) => {
  //       if (res.data) {
  //         let response = res.data;
  //         let status = res.status;
  //         if (status == (200 || 201)) {
  //           setHistory(response.data);
  //         }
  //       } else {
  //         const response = res.response;
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });

  //   // socket.on('depositRequest', (data) => {
  //   //   console.log('depositRequest', eeeeeeeeeee);
  //   // });

  //   // socket.on('receive_message', (data) => {
  //   //   setStream(data?.message);
  //   //   console.log('receive_message', data);
  //   // });

  //   // socket.onAny(() => {
  //   //   console.log("eeeeeee", lllololo);
  //   // });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    setLoading(false);
    const data = { idCountry: globalState?.idPays };
    WithdrawAPI.getWithdrawsByCountry(data, globalState?.key)
      .then((res) => {
        if (res.data) {
          let response = res.data;
          let status = res.status;
          if (status == (200 || 201)) {
            const pendingWithdraws = response.data.filter((item) => item.etat === 'pending');
            // console.log(pendingWithdraws);
            setWithdraws(pendingWithdraws);
          }
        } else {
          const response = res.response;
        }
      })
      .catch((err) => {
        console.log(err);
      });
    DepositsAPI.getAllDepositsByCountry(data, globalState?.key)
      .then((res) => {
        if (res.data) {
          let response = res.data;
          let status = res.status;
          if (status == (200 || 201)) {
            const pendindeposits = response.data.filter((item) => item.etat === 'pending');
            setDeposits(pendindeposits);

            // console.log(pendindeposits);
          }
        } else {
          const response = res.response;
        }
      })
      .catch((err) => {
        console.log(err);
      });
    const total = { total: 10 };
    HistoryAPI.getAgentHistory(total, globalState?.key)
      .then((res) => {
        if (res.data) {
          let response = res.data;
          let status = res.status;
          if (status == (200 || 201)) {
            setHistory(response.data);
          }
        } else {
          const response = res.response;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  console.log('stream', globalState);
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        {/* <Button onClick={joinSession}>Join Session</Button> */}
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} deposits={deposits} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <TotalOrderLineChartCard isLoading={isLoading} withdraws={withdraws} />
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeDarkCard isLoading={isLoading} userData={globalState} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeLightCard isLoading={isLoading} userData={globalState} />
              </Grid>
            </Grid>
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
