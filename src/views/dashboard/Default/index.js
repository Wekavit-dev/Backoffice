/* eslint-disable no-unused-vars */
import { useEffect, useState, useContext } from 'react';

// material-ui
import { Button, Grid, Skeleton } from '@mui/material';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import { gridSpacing } from 'store/constant';
import { AppContext } from 'AppContext';
import UsersApi from 'api/users/users';
import SavingsApi from 'api/saves/save';
import systemApi from 'api/system/system';
import AgentApi from 'api/agents/agent';

// ==============================|| DEFAULT DASHBOARD ||==============================
//
const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [todaDeposits, setTodayDeposits] = useState([]);
  const [todayUsers, setTodayUsers] = useState([]);
  const [savings, setSavings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch users
        const usersResponse = await UsersApi.getAllUsers({}, globalState?.key);
        if (usersResponse.data) {
          const { data: response, status } = usersResponse;
          if (status === 200 || status === 201) {
            setUsers(response.data);
          }
        } else {
          console.log('Error getting users:', usersResponse.response);
        }

        // Fetch savings
        const savingsResponse = await SavingsApi.getAllSavings({}, globalState?.key);
        if (savingsResponse.data) {
          const { data: response, status } = savingsResponse;
          if (status === 200 || status === 201) {
            setSavings(response.data || response);
          }
        } else {
          console.log('Error getting savings:', savingsResponse.response);
        }

        // Fetch today's users
        const todayUsersResponse = await UsersApi.getTodayUsers(globalState?.key);
        if (todayUsersResponse.data) {
          const { data: response, status } = todayUsersResponse;
          if (status === 200 || status === 201) {
            setTodayUsers(response?.data?.total || response);
          }
        } else {
          console.log('Error getting deposits:', todayUsersResponse.response);
        }

        // Fetch agents
        const agentsResponse = await AgentApi.getAgents(globalState?.key);
        if (agentsResponse.data) {
          const { data: response, status } = agentsResponse;
          if (status === 200 || status === 201) {
            setAgents(response.data || response);
          }
        } else {
          console.log('Error getting agents:', agentsResponse.response);
        }

        // Fetch today's deposits
        const todayDepositResponse = await systemApi.getAllTodayDeposits(globalState?.key);
        if (todayDepositResponse.data) {
          const { data: response, status } = todayDepositResponse;
          if (status === 200 || status === 201) {
            setTodayDeposits(response?.data?.total || response);
          }
        } else {
          console.log('Error getting deposits:', todayDepositResponse.response);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (globalState?.key) {
      fetchData();
    }
  }, [globalState?.key]);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} users={users} savings={users} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <TotalOrderLineChartCard isLoading={isLoading} users={users} savings={savings} />
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <Grid container spacing={gridSpacing}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeDarkCard isLoading={isLoading} userData={globalState} todayUsers={todayUsers} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeLightCard isLoading={isLoading} userData={globalState} todaDeposits={todaDeposits} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item xs={12} md={8}>
            <TotalGrowthBarChart isLoading={isLoading} savings={savings} />
          </Grid>
          <Grid item xs={12} md={4}>
            <PopularCard isLoading={isLoading} userData={globalState} users={users} agents={agents} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
