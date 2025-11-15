// // src/pages/Statistics/StatisticsPage.js
// import React, { useState, useEffect, useContext } from 'react';
// import {
//   Box,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   CircularProgress,
//   Alert,
//   Paper,
//   Container
// } from '@mui/material';
// import {
//   TrendingUp,
//   AccountBalance,
//   Payments,
//   Money,
//   Savings,
//   Warning
// } from '@mui/icons-material';
// import { FundsAPI, ExpensesAPI, LoansAPI } from 'api';
// import { AppContext } from 'AppContext';

// // Composant de carte de statistique
// const StatCard = ({ title, value, subtitle, icon, color = '#1976d2', loading = false }) => (
//   <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 0 }}>
//     <CardContent sx={{ p: 3 }}>
//       <Box display="flex" alignItems="center" justifyContent="space-between">
//         <Box>
//           <Typography color="textSecondary" gutterBottom variant="h6" fontWeight="500">
//             {title}
//           </Typography>
//           {loading ? (
//             <CircularProgress size={30} />
//           ) : (
//             <Typography variant="h4" component="div" fontWeight="bold" color={color}>
//               {value}
//             </Typography>
//           )}
//           {subtitle && (
//             <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
//               {subtitle}
//             </Typography>
//           )}
//         </Box>
//         <Box
//           sx={{
//             backgroundColor: `${color}15`,
//             borderRadius: 3,
//             p: 2,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center'
//           }}
//         >
//           {React.cloneElement(icon, { 
//             sx: { fontSize: 32, color: color } 
//           })}
//         </Box>
//       </Box>
//     </CardContent>
//   </Card>
// );

// // Composant de graphique simple (placeholder)
// const SimpleChart = ({ title, data, color = '#1976d2' }) => (
//   <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
//     <CardContent sx={{ p: 3 }}>
//       <Typography variant="h6" gutterBottom fontWeight="500">
//         {title}
//       </Typography>
//       <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1, mt: 2 }}>
//         {data.map((item, index) => (
//           <Box
//             key={index}
//             sx={{
//               flex: 1,
//               backgroundColor: color,
//               height: `${item.value}%`,
//               borderRadius: 1,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               color: 'white',
//               fontSize: 12,
//               fontWeight: 'bold'
//             }}
//           >
//             {item.label}
//           </Box>
//         ))}
//       </Box>
//     </CardContent>
//   </Card>
// );

// // Composant de liste
// const SimpleList = ({ title, items, icon, color = '#1976d2' }) => (
//   <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 2 }}>
//     <CardContent sx={{ p: 3 }}>
//       <Typography variant="h6" gutterBottom fontWeight="500">
//         {title}
//       </Typography>
//       <Box sx={{ mt: 2 }}>
//         {items.map((item, index) => (
//           <Box
//             key={index}
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               py: 1.5,
//               borderBottom: index < items.length - 1 ? '1px solid #f0f0f0' : 'none'
//             }}
//           >
//             <Box
//               sx={{
//                 backgroundColor: `${color}15`,
//                 borderRadius: '50%',
//                 p: 1,
//                 mr: 2,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}
//             >
//               {React.cloneElement(icon, { 
//                 sx: { fontSize: 16, color: color } 
//               })}
//             </Box>
//             <Box flex={1}>
//               <Typography variant="body1" fontWeight="500">
//                 {item.title}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 {item.subtitle}
//               </Typography>
//             </Box>
//             <Typography 
//               variant="body2" 
//               fontWeight="500"
//               sx={{ color: item.status === 'Actif' ? '#2e7d32' : '#ed6c02' }}
//             >
//               {item.status}
//             </Typography>
//           </Box>
//         ))}
//       </Box>
//     </CardContent>
//   </Card>
// );

// const StatisticsPage = () => {
//   const [stats, setStats] = useState({
//     funds: null,
//     expenses: null,
//     loans: null
//   });
//   const { globalState } = useContext(AppContext);
//   const token = globalState?.key || '';
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

  

//   console.log("Token", globalState);

//   const loadStatistics = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Charger les statistiques des fonds
//       const fundsBalance = await FundsAPI.getTotalBalanceByCurrency(token);
//       const allFunds = await FundsAPI.getAllFunds(token);

//       // Charger les statistiques des dépenses
//       const expensesStats = await ExpensesAPI.getGlobalExpenseStatistics(token);
//       const allExpenses = await ExpensesAPI.getAllExpenses({ page: 1, limit: 5 }, token);

//       // Charger les statistiques des prêts
//       const loansStats = await LoansAPI.getGlobalLoanStatistics(token);
//       const allLoans = await LoansAPI.getAllLoans({ page: 1, limit: 5 }, token);

//       setStats({
//         funds: {
//           balance: fundsBalance.data,
//           all: allFunds.data
//         },
//         expenses: {
//           stats: expensesStats.data,
//           recent: allExpenses.data
//         },
//         loans: {
//           stats: loansStats.data,
//           recent: allLoans.data
//         }
//       });

//     } catch (err) {
//       console.error('Erreur lors du chargement des statistiques:', err);
//       setError('Erreur lors du chargement des données');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStatistics();
//   }, []);

//   // Données simulées pour les graphiques (à remplacer par les vraies données)
//   const growthData = [
//     { label: 'Lun', value: 60 },
//     { label: 'Mar', value: 80 },
//     { label: 'Mer', value: 45 },
//     { label: 'Jeu', value: 90 },
//     { label: 'Ven', value: 70 },
//     { label: 'Sam', value: 50 },
//     { label: 'Dim', value: 85 }
//   ];

//   const expenseByCategory = [
//     { label: 'Opérationnel', value: 40 },
//     { label: 'Admin', value: 25 },
//     { label: 'Tech', value: 20 },
//     { label: 'Marketing', value: 15 }
//   ];

//   // Données simulées pour les listes
//   const recentFunds = stats.funds?.all?.data?.slice(0, 5)?.map(fund => ({
//     title: fund.name,
//     subtitle: `${fund.availableBalance} ${fund.currency} disponible`,
//     status: fund.status === 'active' ? 'Actif' : 'Inactif'
//   })) || [];

//   const recentExpenses = stats.expenses?.recent?.data?.slice(0, 5)?.map(expense => ({
//     title: expense.reason,
//     subtitle: `${expense.amount} ${expense.currency}`,
//     status: 'Complété'
//   })) || [];

//   const recentLoans = stats.loans?.recent?.data?.slice(0, 5)?.map(loan => ({
//     title: `${loan.beneficiary.firstName} ${loan.beneficiary.lastName}`,
//     subtitle: `${loan.amount} ${loan.currency}`,
//     status: loan.status === 'active' ? 'Actif' : loan.status
//   })) || [];

//   if (loading && !stats.funds) {
//     return (
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
//           <CircularProgress />
//         </Box>
//       </Container>
//     );
//   }

//   console.log("Stats", stats);

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       {/* En-tête */}
//       <Box mb={4}>
//         <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
//           Tableau de Bord Financier
//         </Typography>
//         <Typography variant="body1" color="textSecondary">
//           Vue d&apos;ensemble complète de vos fonds, dépenses et prêts
//         </Typography>
//       </Box>

//       {error && (
//         <Alert severity="error" sx={{ mb: 3 }}>
//           {error}
//         </Alert>
//       )}

//       {/* Section Fonds */}
//       <Box mb={6}>
//   <Typography variant="h5" component="h2" fontWeight="600" mb={3} color="#1976d2">
//     Fonds
//   </Typography>

//   {/* Sélecteur de devise */}
//   {stats.funds?.balance?.data?.length > 1 && (
//     <Box mb={3}>
//       <Typography variant="body1" fontWeight="500" mb={1}>
//         Sélectionnez une devise :
//       </Typography>
//       {/* Vous pouvez utiliser un Select MUI ici si besoin */}
//       <Box display="flex" gap={1} flexWrap="wrap">
//         {stats.funds.balance.data.map((currencyData) => (
//           <Box
//             key={currencyData._id}
//             sx={{
//               px: 2,
//               py: 1,
//               borderRadius: 2,
//               backgroundColor: '#1976d2',
//               color: 'white',
//               cursor: 'pointer',
//               fontWeight: '500'
//             }}
//           >
//             {currencyData._id}
//           </Box>
//         ))}
//         <Box
//           sx={{
//             px: 2,
//             py: 1,
//             borderRadius: 2,
//             backgroundColor: '#9c27b0',
//             color: 'white',
//             cursor: 'pointer',
//             fontWeight: '500'
//           }}
//         >
//           Toutes
//         </Box>
//       </Box>
//     </Box>
//   )}

//   {/* Cartes de statistiques - Afficher toutes les devises côte à côte */}
//   <Grid container spacing={3}>
//     {stats.funds?.balance?.data?.map((currencyData, index) => (
//       <React.Fragment key={currencyData._id}>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title={`Total ${currencyData._id}`}
//             value={currencyData.totalBalance?.toLocaleString() || 0}
//             subtitle={`Solde en ${currencyData._id}`}
//             icon={<AccountBalance />}
//             color={index === 0 ? "#1976d2" : index === 1 ? "#2e7d32" : index === 2 ? "#ed6c02" : "#9c27b0"}
//             loading={loading}
//           />
//         </Grid>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title={`Disponible ${currencyData._id}`}
//             value={currencyData.totalAvailable?.toLocaleString() || 0}
//             subtitle={`Utilisable en ${currencyData._id}`}
//             icon={<Savings />}
//             color={index === 0 ? "#1976d2" : index === 1 ? "#2e7d32" : index === 2 ? "#ed6c02" : "#9c27b0"}
//             loading={loading}
//           />
//         </Grid>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title={`Alloué ${currencyData._id}`}
//             value={currencyData.totalAllocated?.toLocaleString() || 0}
//             subtitle={`Engagé en ${currencyData._id}`}
//             icon={<Money />}
//             color={index === 0 ? "#1976d2" : index === 1 ? "#2e7d32" : index === 2 ? "#ed6c02" : "#9c27b0"}
//             loading={loading}
//           />
//         </Grid>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title={`Fonds ${currencyData._id}`}
//             value={currencyData.fundCount || 0}
//             subtitle={`Comptes en ${currencyData._id}`}
//             icon={<TrendingUp />}
//             color={index === 0 ? "#1976d2" : index === 1 ? "#2e7d32" : index === 2 ? "#ed6c02" : "#9c27b0"}
//             loading={loading}
//           />
//         </Grid>
//       </React.Fragment>
//     ))}
//   </Grid>

//   {/* Résumé global si plusieurs devises */}
//   {stats.funds?.balance?.data?.length > 1 && (
//     <Box mt={4}>
//       <Typography variant="h6" fontWeight="500" mb={2} color="#1976d2">
//         Résumé Global
//       </Typography>
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title="Total Global"
//             value={stats.funds?.balance?.data?.reduce((total, item) => total + item.totalBalance, 0)?.toLocaleString() || 0}
//             subtitle="Toutes devises confondues"
//             icon={<AccountBalance />}
//             color="#1976d2"
//             loading={loading}
//           />
//         </Grid>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title="Disponible Global"
//             value={stats.funds?.balance?.data?.reduce((total, item) => total + item.totalAvailable, 0)?.toLocaleString() || 0}
//             subtitle="Montant total utilisable"
//             icon={<Savings />}
//             color="#2e7d32"
//             loading={loading}
//           />
//         </Grid>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title="Alloué Global"
//             value={stats.funds?.balance?.data?.reduce((total, item) => total + item.totalAllocated, 0)?.toLocaleString() || 0}
//             subtitle="Montant total engagé"
//             icon={<Money />}
//             color="#ed6c02"
//             loading={loading}
//           />
//         </Grid>
//         <Grid item xs={12} md={3}>
//           <StatCard
//             title="Total Comptes"
//             value={stats.funds?.balance?.data?.reduce((total, item) => total + item.fundCount, 0) || 0}
//             subtitle="Nombre total de fonds"
//             icon={<TrendingUp />}
//             color="#9c27b0"
//             loading={loading}
//           />
//         </Grid>
//       </Grid>
//     </Box>
//   )}

//   {/* Graphique et liste */}
//   <Grid container spacing={3} mt={2}>
//     <Grid item xs={12} md={8}>
//       <SimpleChart
//         title="Croissance des Fonds"
//         data={growthData}
//         color="#1976d2"
//       />
//     </Grid>
//     <Grid item xs={12} md={4}>
//       <SimpleList
//         title="Fonds Récents"
//         items={recentFunds}
//         icon={<AccountBalance />}
//         color="#1976d2"
//       />
//     </Grid>
//   </Grid>
// </Box>

//       {/* Section Dépenses */}
//       {/* <Box mb={6}>
//         <Typography variant="h5" component="h2" fontWeight="600" mb={3} color="#d32f2f">
//           Dépenses
//         </Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="Total Dépenses"
//               value={stats.expenses?.stats?.total?.totalAmount || 0}
//               subtitle="Montant total dépensé"
//               icon={<Payments />}
//               color="#d32f2f"
//               loading={loading}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="Nombre de Dépenses"
//               value={stats.expenses?.stats?.total?.totalCount || 0}
//               subtitle="Transactions effectuées"
//               icon={<Money />}
//               color="#ed6c02"
//               loading={loading}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="Dépenses Opérationnelles"
//               value={stats.expenses?.stats?.byType?.find(item => item._id.category === 'operationnel')?.totalAmount || 0}
//               subtitle="Coûts d&apos;exploitation"
//               icon={<TrendingUp />}
//               color="#9c27b0"
//               loading={loading}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="Dépenses ce Mois"
//               value="0" // À calculer avec les vraies données
//               subtitle="Période courante"
//               icon={<Savings />}
//               color="#2e7d32"
//               loading={loading}
//             />
//           </Grid>

//           <Grid item xs={12} md={8}>
//             <SimpleChart
//               title="Dépenses par Catégorie"
//               data={expenseByCategory}
//               color="#d32f2f"
//             />
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <SimpleList
//               title="Dépenses Récentes"
//               items={recentExpenses}
//               icon={<Payments />}
//               color="#d32f2f"
//             />
//           </Grid>
//         </Grid>
//       </Box> */}

//       {/* Section Prêts */}
//       {/* <Box mb={6}>
//         <Typography variant="h5" component="h2" fontWeight="600" mb={3} color="#2e7d32">
//           Prêts
//         </Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="Total Prêts Actifs"
//               value={stats.loans?.stats?.total?.totalAmount || 0}
//               subtitle="Capital prêté"
//               icon={<Money />}
//               color="#2e7d32"
//               loading={loading}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="À Récupérer"
//               value={stats.loans?.stats?.total?.totalToReceive || 0}
//               subtitle="Capital + intérêts"
//               icon={<TrendingUp />}
//               color="#1976d2"
//               loading={loading}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="Prêts en Retard"
//               value={stats.loans?.stats?.overdueLoans || 0}
//               subtitle="Échéances dépassées"
//               icon={<Warning />}
//               color="#d32f2f"
//               loading={loading}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <StatCard
//               title="Total Prêts"
//               value={stats.loans?.stats?.total?.totalCount || 0}
//               subtitle="Nombre de prêts"
//               icon={<AccountBalance />}
//               color="#9c27b0"
//               loading={loading}
//             />
//           </Grid>

//           <Grid item xs={12} md={8}>
//             <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
//               <CardContent sx={{ p: 3 }}>
//                 <Typography variant="h6" gutterBottom fontWeight="500">
//                   Répartition des Prêts par Statut
//                 </Typography>
//                 <Box sx={{ mt: 3 }}>
//                   {stats.loans?.stats?.byStatus?.map((status) => (
//                     <Box key={status._id} sx={{ mb: 2 }}>
//                       <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
//                         <Typography variant="body2" fontWeight="500">
//                           {status._id}
//                         </Typography>
//                         <Typography variant="body2" color="textSecondary">
//                           {status.count} prêts • {status.totalAmount}
//                         </Typography>
//                       </Box>
//                       <Box
//                         sx={{
//                           width: '100%',
//                           height: 8,
//                           backgroundColor: '#f0f0f0',
//                           borderRadius: 4,
//                           overflow: 'hidden'
//                         }}
//                       >
//                         <Box
//                           sx={{
//                             height: '100%',
//                             backgroundColor: 
//                               status._id === 'active' ? '#2e7d32' :
//                               status._id === 'completed' ? '#1976d2' :
//                               status._id === 'pending' ? '#ed6c02' : '#d32f2f',
//                             width: `${(status.count / stats.loans.stats.total.totalCount) * 100}%`
//                           }}
//                         />
//                       </Box>
//                     </Box>
//                   ))}
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <SimpleList
//               title="Prêts Récents"
//               items={recentLoans}
//               icon={<Money />}
//               color="#2e7d32"
//             />
//           </Grid>
//         </Grid>
//       </Box> */}

//       {/* Section Résumé Global */}
//       {/* <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2, backgroundColor: '#f8f9fa' }}>
//         <Typography variant="h6" gutterBottom fontWeight="600">
//           Résumé Financier Global
//         </Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={4}>
//             <Box textAlign="center">
//               <Typography variant="h4" fontWeight="bold" color="#1976d2">
//                 {stats.funds?.balance?.reduce((total, item) => total + item.totalBalance, 0) || 0}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Total des Fonds
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Box textAlign="center">
//               <Typography variant="h4" fontWeight="bold" color="#d32f2f">
//                 {stats.expenses?.stats?.total?.totalAmount || 0}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Total des Dépenses
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Box textAlign="center">
//               <Typography variant="h4" fontWeight="bold" color="#2e7d32">
//                 {stats.loans?.stats?.total?.totalToReceive || 0}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Prêts à Récupérer
//               </Typography>
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper> */}
//     </Container>
//   );
// };

// export default StatisticsPage;