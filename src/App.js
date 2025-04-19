import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { useEffect, useContext, useState } from 'react';
import { AppContext } from 'AppContext';
import { io } from 'socket.io-client';

// routing
import Routes from 'routes';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

// ==============================|| APP ||============================== //

const App = () => {
  const customization = useSelector((state) => state.customization);
  const { globalState } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const agentId = globalState?._id;
  useEffect(() => {
    // Request notification permission (if not already granted)

    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      });
    }
    const newSocket = io(`http://192.168.30.94:8000`); // Your server URL
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('join', agentId); // Emit 'join' event with the agent's ID
    });

    newSocket.on('newDeposit', (notification) => {
      setNotifications((prevNotifications) => [...prevNotifications, notification]);
      if (Notification.permission === 'granted') {
        new Notification('Nouveau dépôt !', {
          // Notification title
          body: notification.message, // Notification message
          icon: '/path/to/your/icon.png' // Optional notification icon
          // Other notification options (see below)
        });
      }
    });
    newSocket.on('newWithdraw', (notification) => {
      setNotifications((prevNotifications) => [...prevNotifications, notification]);
      if (Notification.permission === 'granted') {
        new Notification('Nouveau retrait !', {
          // Notification title
          body: notification.message, // Notification message
          icon: '/path/to/your/icon.png' // Optional notification icon
          // Other notification options (see below)
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [agentId]);

  console.log(notifications, socket);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          <Routes />
        </NavigationScroll>
      </ThemeProvider>
      <ToastContainer />
    </StyledEngineProvider>
  );
};

export default App;
