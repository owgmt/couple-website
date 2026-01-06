import { NavLink } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <NavLink to="/" className="nav-logo">
            <span className="heart">♥</span>
            <span>我们的故事</span>
          </NavLink>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              首页
            </NavLink>
            <NavLink to="/timeline" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              动态
            </NavLink>
            <NavLink to="/anniversaries" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              纪念日
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>Made with <span className="heart">♥</span> for us</p>
      </footer>
    </div>
  );
}
