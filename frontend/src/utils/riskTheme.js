export const RISK_COLORS = {
  'Very High': '#ff4d6d',
  High: '#ff9f1c',
  Medium: '#ffd166',
  Low: '#36d399',
  'Very Low': '#38bdf8',
};

export const getRiskColor = (tier) => RISK_COLORS[tier] || '#94a3b8';

export const getRiskBadgeStyle = (tier) => {
  const color = getRiskColor(tier);
  return {
    color,
    background: `${color}1f`,
    border: `1px solid ${color}66`,
  };
};
