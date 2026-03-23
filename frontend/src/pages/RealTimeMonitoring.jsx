import React from 'react';
import { motion } from 'framer-motion';
import MonitoringPanel from '../components/RealTimeMonitoring';

const RealTimeMonitoringPage = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '40px' }}
        >
            <MonitoringPanel />
        </motion.div>
    );
};

export default RealTimeMonitoringPage;
