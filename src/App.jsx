import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Anniversaries = lazy(() => import('./pages/Anniversaries'));
const Admin = lazy(() => import('./pages/Admin'));

// 加载中组件
function Loading() {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/anniversaries" element={<Anniversaries />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
