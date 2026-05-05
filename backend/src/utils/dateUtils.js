/**
 * Standardizes date formatting for MySQL
 */
const formatToMySQL = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    // Format: YYYY-MM-DD HH:mm:ss
    return d.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Standardizes date only (no time)
 */
const formatToMySQLDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    return d.toISOString().slice(0, 10);
};

module.exports = {
    formatToMySQL,
    formatToMySQLDate
};
