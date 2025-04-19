// material-ui
// import { Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import DepositList from './DepositList';

// ==============================|| SAMPLE PAGE ||============================== //

const SamplePage = () => (
  <MainCard title="Deposit" sx={{ height: '100%', overflow: 'auto' }}>
    <DepositList />
  </MainCard>
);

export default SamplePage;
