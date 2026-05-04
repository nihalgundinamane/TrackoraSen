import React, { Suspense, lazy, useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import ImportModal from './components/Import/ImportModal';
import { useTheme } from './hooks/useTheme';
import { useAnimeStore } from './hooks/useAnimeStore';
import { useSections } from './hooks/useSections';
import { useAuth } from './hooks/useAuth';
import { useCloudSync } from './hooks/useCloudSync';
import './styles/globals.css';

const Home      = lazy(() => import('./pages/Home/Home'));
const WatchList = lazy(() => import('./pages/WatchList/WatchList'));
const StatsPage = lazy(() => import('./pages/Stats/StatsPage'));

const Spinner = () => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                height:'100vh', color:'var(--accent)', fontSize:'2rem' }}>✦</div>
);

const exportData = (list) => {
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `trackorasen-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const App = () => {
  const { theme, setTheme }                    = useTheme();
  const store                                  = useAnimeStore();
  const sections                               = useSections();
  const { user, isLoading, login, logout }     = useAuth();
  const [showImport, setShowImport]            = useState(false);

  const handleRemoteUpdate = useCallback((remoteList) => {
    store.loadList(remoteList);
  }, [store]);

  const { syncStatus } = useCloudSync(user, store.list, handleRemoteUpdate);

  // Shared navbar props
  const navbarProps = {
    theme, setTheme,
    animeList: store.list,
    user: isLoading ? undefined : user,
    syncStatus,
    onLogin:       login,
    onLogout:      logout,
    onExport:      () => exportData(store.list),
    onImportClick: () => setShowImport(true),
  };

  return (
    <BrowserRouter>
      {/* Single navbar — contains search, export, import, theme, sync, login */}
      <Navbar {...navbarProps} />

      {/* Global import modal — triggered from navbar */}
      {showImport && (
        <ImportModal
          onImport={store.importAnime}
          onClose={() => setShowImport(false)}
        />
      )}

      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home animeList={store.list} />} />

          <Route
            path="/list"
            element={
              <WatchList
                bySection={store.bySection}
                onAdd={store.add}
                onUpdate={store.update}
                onDelete={store.remove}
                onWatchedChange={store.setWatched}
                onSeasonWatched={store.setSeasonWatched}
                onBulkMove={store.bulkMoveSection}
                onImport={store.importAnime}
                onMoveToWatching={(id) => store.moveSection(id, 'watching')}
                sections={sections.sections}
                onAddSection={sections.addSection}
                onRenameSection={sections.renameSection}
                onRemoveSection={sections.removeSection}
                onReorderSection={sections.reorderSection}
                onResetSections={sections.resetSections}
                sectionIcons={sections.SECTION_ICONS}
              />
            }
          />

          <Route path="/stats" element={<StatsPage animeList={store.list} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
