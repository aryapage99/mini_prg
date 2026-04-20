const fs = require('fs');
const path = require('path');

const DEFAULT_LIMIT = Number.parseInt(process.env.TAVILY_FREE_TIER_LIMIT || '900', 10);
const usageFilePath = process.env.TAVILY_USAGE_FILE_PATH || path.join(__dirname, '..', 'data', 'tavily-usage.json');

function getCurrentPeriod() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function ensureUsageDirectory() {
    fs.mkdirSync(path.dirname(usageFilePath), { recursive: true });
}

function normalizeUsage(usage) {
    const period = getCurrentPeriod();

    if (!usage || usage.period !== period) {
        return { period, count: 0 };
    }

    return {
        period,
        count: Number.isFinite(usage.count) ? usage.count : 0
    };
}

function readUsage() {
    try {
        const raw = fs.readFileSync(usageFilePath, 'utf-8');
        return normalizeUsage(JSON.parse(raw));
    } catch (error) {
        return normalizeUsage(null);
    }
}

function writeUsage(usage) {
    ensureUsageDirectory();
    fs.writeFileSync(usageFilePath, JSON.stringify(usage, null, 2));
}

function getQuotaStatus() {
    const usage = readUsage();
    const limit = Number.isFinite(DEFAULT_LIMIT) ? DEFAULT_LIMIT : 900;

    return {
        period: usage.period,
        used: usage.count,
        limit,
        remaining: Math.max(limit - usage.count, 0)
    };
}

function assertQuotaAvailable() {
    const quota = getQuotaStatus();

    if (quota.remaining < 1) {
        const error = new Error('Tavily free-tier safety limit reached for the current month.');
        error.code = 'TAVILY_QUOTA_EXCEEDED';
        error.quota = quota;
        throw error;
    }

    return quota;
}

function recordSearchRequest() {
    const usage = readUsage();
    usage.count += 1;
    writeUsage(usage);
    return getQuotaStatus();
}

module.exports = {
    assertQuotaAvailable,
    getQuotaStatus,
    recordSearchRequest
};