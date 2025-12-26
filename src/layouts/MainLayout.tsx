import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    Factory,
    ShoppingCart,
    Receipt,
    BarChart3,
    LogOut,
    Menu,
    X,
    Palette,
    MapPin,
    Settings,
    Users
} from 'lucide-react';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/stock', label: 'Estoque', icon: Package },
    { path: '/production', label: 'Produção', icon: Factory },
    { path: '/sales', label: 'Vendas', icon: ShoppingCart },
    { path: '/expenses', label: 'Despesas', icon: Receipt },
    { path: '/reports', label: 'Relatórios', icon: BarChart3 },
    { path: '/sabores', label: 'Sabores', icon: Palette },
    { path: '/regioes', label: 'Regiões', icon: MapPin },
    { path: '/parameters', label: 'Parâmetros', icon: Settings },
];

export default function MainLayout({ children }: MainLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="/images/admin-pinguim.png" alt="Pinguim Ice" className="logo-image" />
                        <div className="logo-text-col">
                            <span className="logo-title">PINGUIM ICE</span>
                            <span className="logo-subtitle">Admin</span>
                        </div>
                    </div>
                    <button
                        className="sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-email">{user?.email}</div>
                        </div>
                    </div>
                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="main-content">
                <header className="header">
                    <button
                        className="menu-button"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <div className="header-title">
                        {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                    </div>
                </header>

                <main className="content">
                    {children}
                </main>
            </div>
        </div>
    );
}
