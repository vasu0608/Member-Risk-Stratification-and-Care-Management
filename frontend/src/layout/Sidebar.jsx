
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Upload,
    UserPlus,
    Activity,
    HeartPulse,
    LogOut,
    TrendingUp,
    ChevronRight,
    SlidersHorizontal
} from 'lucide-react';
import { logout } from '../services/api';

const Sidebar = () => {
    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    const navItems = [
        { to: "/", icon: <LayoutDashboard size={20} />, label: "Health Overview" },
        { to: "/monitoring", icon: <HeartPulse size={20} />, label: "Real Time Monitoring" },
        { to: "/analytics", icon: <TrendingUp size={20} />, label: "Analytics" },
        { to: "/add-member", icon: <UserPlus size={20} />, label: "Add Member Form" },
        { to: "/upload", icon: <Upload size={20} />, label: "Batch CSV Upload" },
        { to: "/settings", icon: <SlidersHorizontal size={20} />, label: "Settings" },
    ];

    return (
        <motion.div
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{
                width: '270px',
                height: '100vh',
                background: 'var(--sidebar-bg)',
                color: 'var(--sidebar-text)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                zIndex: 100,
                boxShadow: '4px 0 24px rgba(0,0,0,0.18)'
            }}
        >
            <div style={{ padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: 'var(--accent-gradient)', padding: '8px', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Activity size={24} color="white" />
                    </motion.div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>CareInsight</h2>
                        <span style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Management</span>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '20px 12px' }}>
                {navItems.map((item, index) => (
                    <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <NavLink
                            to={item.to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                marginBottom: '8px',
                                color: isActive ? 'var(--sidebar-text)' : 'var(--sidebar-muted)',
                                background: isActive ? 'var(--sidebar-active)' : 'transparent',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: isActive ? '1px solid var(--sidebar-active-border)' : '1px solid transparent'
                            })}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ opacity: 0.9 }}>{item.icon}</span>
                                <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{item.label}</span>
                            </div>
                            <ChevronRight size={16} style={{ opacity: 0.4 }} />
                        </NavLink>
                    </motion.div>
                ))}
            </nav>

            <div style={{ padding: '24px', borderTop: '1px solid var(--sidebar-separator)' }}>
                <motion.button
                    whileHover={{ x: 5, color: '#ef4444' }}
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--sidebar-muted)',
                        cursor: 'pointer',
                        padding: '10px',
                        width: '100%',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
