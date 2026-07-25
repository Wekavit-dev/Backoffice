import React, { useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from 'AppContext';
import { useAdminAccess } from 'hooks/useAdminAccess';
import AdminsApi from 'api/admins/admins';
import AdminHero from './components/AdminHero';
import AdminTeamList from './components/AdminTeamList';
import MenuAccessPanel from './components/MenuAccessPanel';
import AddAdminModal from './components/AddAdminModal';
import { Users, Shield, CheckCircle2, Wifi, ChevronRight, Sparkles } from 'lucide-react';

const TOTAL_MENU_SLOTS = 27;

const Administrator = () => {
  const { globalState } = useContext(AppContext);
  const { isSuperAdmin } = useAdminAccess();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileShowPanel, setMobileShowPanel] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AdminsApi.getAdmins(globalState?.key);
      if (response?.data) {
        const payload = response.data?.data || response.data || [];
        const list = Array.isArray(payload) ? payload : [];
        setAdmins(list);
        setSelectedAdmin((prev) => {
          if (!list.length) return null;
          if (prev) {
            const stillThere = list.find((item) => item._id === prev._id);
            return stillThere || list[0];
          }
          return list[0];
        });
      }
    } catch (error) {
      toast.error('Impossible de charger les administrateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (globalState?.key) {
      fetchData();
    }
  }, [globalState?.key]);

  const filteredAdmins = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesSearch =
        !q || admin.nom?.toLowerCase().includes(q) || admin.email?.toLowerCase().includes(q);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'verified' && admin.verified) ||
        (filter === 'super' && admin.isSuperAdmin) ||
        (filter === 'online' && admin.connected);

      return matchesSearch && matchesFilter;
    });
  }, [admins, searchTerm, filter]);

  const stats = useMemo(
    () => ({
      total: admins.length,
      verified: admins.filter((admin) => admin.verified).length,
      connected: admins.filter((admin) => admin.connected).length,
      superAdmins: admins.filter((admin) => admin.isSuperAdmin).length
    }),
    [admins]
  );

  const handleCreateAdmin = async (form, resetForm) => {
    setIsSubmitting(true);
    try {
      const response = await AdminsApi.createAdmin(
        { nom: form.nom, email: form.email, password: form.password },
        globalState?.key
      );

      const ok =
        response?.status === 200 ||
        response?.status === 201 ||
        response?.data?.status === 200 ||
        response?.data?.status === 201;

      if (ok) {
        toast.success('Administrateur créé avec succès');
        setAddModalOpen(false);
        resetForm();
        await fetchData();
        setMobileShowPanel(true);
        return;
      }

      toast.error("Erreur lors de la création de l'administrateur");
    } catch (error) {
      toast.error("Erreur lors de la création de l'administrateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessSaved = (payload) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin._id === selectedAdmin?._id
          ? { ...admin, menuAccess: payload.menuAccess, isSuperAdmin: payload.isSuperAdmin }
          : admin
      )
    );
    setSelectedAdmin((prev) =>
      prev ? { ...prev, menuAccess: payload.menuAccess, isSuperAdmin: payload.isSuperAdmin } : prev
    );
  };

  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin);
    setMobileShowPanel(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="admin-page relative pb-28 p-6 max-w-7xl mx-auto">
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-indigo-500/10 to-transparent" />

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && !admins.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center gap-4 shadow-xl">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chargement des administrateurs...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Administration
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gérez les administrateurs et leurs permissions
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total', value: stats.total, icon: Users, color: 'from-blue-500 to-indigo-600' },
              { label: 'Vérifiés', value: stats.verified, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
              { label: 'Connectés', value: stats.connected, icon: Wifi, color: 'from-cyan-500 to-blue-600' },
              { label: 'Super Admins', value: stats.superAdmins, icon: Shield, color: 'from-purple-500 to-pink-600' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 text-white shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium opacity-80">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-6 w-6 opacity-80" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content */}
          <AdminHero stats={stats} isSuperAdmin={isSuperAdmin} onAdd={() => setAddModalOpen(true)} />

          <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
            {/* Left Panel - Admin List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`${mobileShowPanel ? 'hidden xl:block' : 'block'}`}
            >
              <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Équipe ({filteredAdmins.length})
                      </h2>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all shadow-sm"
                      >
                        <Sparkles className="h-3 w-3" />
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>
                <AdminTeamList
                  admins={filteredAdmins}
                  loading={loading}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filter={filter}
                  onFilterChange={setFilter}
                  selectedAdmin={selectedAdmin}
                  onSelect={handleSelectAdmin}
                  totalMenus={TOTAL_MENU_SLOTS}
                />
              </div>
            </motion.div>

            {/* Right Panel - Menu Access */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`${mobileShowPanel ? 'block' : 'hidden xl:block'}`}
            >
              <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Permissions
                      </h2>
                    </div>
                    {mobileShowPanel && (
                      <button
                        onClick={() => setMobileShowPanel(false)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        Retour
                      </button>
                    )}
                  </div>
                </div>
                <MenuAccessPanel
                  admin={selectedAdmin}
                  token={globalState?.key}
                  isSuperAdminViewer={isSuperAdmin}
                  onSaved={handleAccessSaved}
                  showBack={false}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Add Admin Modal */}
        <AddAdminModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleCreateAdmin}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default Administrator;