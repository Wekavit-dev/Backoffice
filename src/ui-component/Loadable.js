import { Component, Suspense } from 'react';

// project imports
import Loader from './Loader';

const CHUNK_RELOAD_KEY = 'chunk-load-reload-at';
const RELOAD_COOLDOWN_MS = 15000;

const isChunkLoadError = (error) => {
  if (!error) return false;
  const message = error.message || '';
  return (
    error.name === 'ChunkLoadError' ||
    /Loading chunk [\d]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
};

/**
 * After a Vercel/CRA redeploy, an open tab may still hold an old main bundle
 * that references deleted hashed chunks (404). One hard reload fixes it.
 */
class ChunkLoadErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: Boolean(error) };
  }

  componentDidCatch(error) {
    if (!isChunkLoadError(error)) return;

    const lastReloadAt = Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    const now = Date.now();
    if (now - lastReloadAt < RELOAD_COOLDOWN_MS) return;

    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return <Loader />;
    }
    return this.props.children;
  }
}

// ==============================|| LOADABLE - LAZY LOADING ||============================== //

const Loadable = (Component) => (props) =>
  (
    <ChunkLoadErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    </ChunkLoadErrorBoundary>
  );

export default Loadable;
