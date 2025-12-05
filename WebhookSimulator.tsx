/ components/views/megadashboard/developer/WebhookSimulator.tsx
// In a real project, you would install these dependencies:
// npm install react-chartjs-2 chart.js @google/genai uuid lodash
// npm install -D @types/uuid @types/lodash
import React, { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import Card from './Card';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import { debounce } from 'lodash';

// --- Chart.js Setup ---
import { Line, Bar, Pie } from 'react-chartjs-2';
import 
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- Type Definitions ---

export interface Webhook {
    id: string;
    url: string;
    status: 'Active' | 'Disabled' | 'Paused';
    events: string[];
    description: string;
    secret: string; // Stored securely, often masked in UI
    createdAt: string;
    updatedAt: string;
    lastEventSentAt?: string;
    deliveryMetrics: {
        totalAttempts: number;
        successfulDeliveries: number;
        failedDeliveries: number;
        avgLatencyMs: number;
    };
    retryPolicy: {
        maxRetries: number;
        initialIntervalSeconds: number;
        multiplier: number;
        maxIntervalSeconds: number;
    };
    headers: { key: string; value: string; id: string; }[];
    authConfig: {
        type: 'none' | 'basic' | 'bearer';
        username?: string;
        password?: string; // Stored securely
        token?: string; // Stored securely
    };
    sslVerificationEnabled: boolean;
    metadata: { [key: string]: string };
    ownerId: string; // The user or service that created it
    environment: 'development' | 'staging' | 'production';
    tags: string[];
}

export interface WebhookEvent {
    id: string;
    webhookId: string;
    type: string;
    status: 'Delivered' | 'Failed' | 'Pending' | 'Retrying';
    payload: object;
    error?: string;
    timestamp: string;
    deliveryAttempts: {
        attempt: number;
        status: 'Success' | 'Failure';
        responseStatus?: number;
        responseText?: string;
        latencyMs: number;
        timestamp: string;
        errorDetails?: string;
    }[];
    externalRef?: string; // e.g., transaction ID
    metadata: { [key: string]: string };
}

export interface WebhookSettings {
    maxRetries: number;
    retryIntervalSeconds: number[]; // e.g., [60, 300, 900] for 1min, 5min, 15min
    timeoutMs: number;
    secretSigningEnabled: boolean;
    deliveryAttemptsLoggingEnabled: boolean;
    defaultHeaders: { key: string; value: string; id: string; }[];
    ipWhitelist: string[];
    rateLimitEnabled: boolean;
    rateLimitRequestsPerMinute: number;
    eventTransformationEnabled: boolean;
    customCertsEnabled: boolean;
    customCertificates: { id: string; name: string; cert: string; expiration: string; }[];
    deadLetterQueueEnabled: boolean;
    deadLetterQueueConfig?: {
        type: 's3' | 'kafka';
        target: string; // e.g., S3 bucket name or Kafka topic
        accessKeyId?: string;
        secretAccessKey?: string;
    };
    globalMonitoringEnabled: boolean;
    webhookBatchingEnabled: boolean;
    batchingIntervalMs?: number;
    batchingMaxEvents?: number;
}

export interface ApiKey {
    id: string;
    name: string;
    key: string; // The actual key (might be masked)
    createdAt: string;
    expiresAt?: string;
    permissions: string[]; // e.g., ['webhook:read', 'webhook:write', 'event:read']
    status: 'Active' | 'Revoked';
    lastUsedAt?: string;
    createdBy: string;
}

export interface AlertRule {
    id: string;
    name: string;
    type: 'webhook_failure_rate' | 'event_latency' | 'delivery_success_rate' | 'endpoint_down' | 'custom_metric';
    threshold: number; // percentage or ms or custom value
    durationMinutes: number; // time window to check threshold
    webhookId?: string; // specific webhook or global
    status: 'Active' | 'Inactive';
    channels: { type: 'email' | 'slack' | 'sms' | 'pagerduty'; recipient: string; id: string; }[];
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    metricPath?: string; // For custom_metric type, e.g., '$.payload.amount'
    operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    condition?: 'all' | 'any'; // all channels or any channel
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actor: string; // User ID or system
    action: string; // e.g., 'webhook.created', 'webhook.updated', 'api_key.revoked'
    resourceType: 'webhook' | 'api_key' | 'settings' | 'event' | 'alert_rule';
    resourceId: string;
    details: object; // Old and new values, specific changes, IP address, user agent
    ipAddress?: string;
    userAgent?: string;
}

export interface WebhookFormData {
    id?: string;
    url: string;
    events: string[];
    status: 'Active' | 'Disabled' | 'Paused';
    description: string;
    secret: string; // for signing, can be empty
    headers: { key: string; value: string; id: string; }[];
    authType: 'none' | 'basic' | 'bearer';
    authToken?: string; // for bearer/basic
    username?: string; // for basic auth
    password?: string; // for basic auth
    sslVerificationEnabled: boolean;
    retryPolicy: {
        maxRetries: number;
        initialIntervalSeconds: number;
        multiplier: number;
        maxIntervalSeconds: number;
    };
    metadata: { key: string; value: string; id: string; }[];
    environment: 'development' | 'staging' | 'production';
    tags: string[];
}

export interface AnalyticsSummary {
    totalEndpoints: number;
    activeEndpoints: number;
    disabledEndpoints: number;
    totalEventsDelivered24h: number;
    failureRate24h: number; // percentage
    avgLatencyMs24h: number;
    pendingEvents: number;
    retryingEvents: number;
    topFailedEndpoints: { id: string; url: string; failures: number; }[];
    eventDistribution: { type: string; count: number; }[];
    latencyP99Ms: number;
    totalEventsProcessedMonth: number;
    successfulEventsMonth: number;
    failedEventsMonth: number;
}

export interface ChartDataPoint {
    time: string;
    value: number;
    label?: string;
    color?: string;
}

export interface ChartConfig {
    id: string;
    title: string;
    type: 'line' | 'bar' | 'pie';
    data: ChartDataPoint[];
    unit?: string;
    timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly';
    description?: string;
}

export interface PaginationInfo {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export interface FilterOptions {
    searchTerm?: string;
    status?: string;
    eventType?: string;
    timeRange?: string;
    severity?: string;
    actor?: string;
    resourceType?: string;
}

export interface EventReplayConfig {
    webhookIds: string[];
    eventTypes: string[];
    statusFilter?: 'Failed' | 'Delivered' | 'All';
    dateRange: { start: string; end: string; };
    maxEvents: number;
    batchSize: number;
    dryRun: boolean;
}

export interface TestEventConfig {
    webhookId?: string; // Optional, can test against a specific one or all matching events
    eventType: string;
    payload: object;
    headers: { key: string; value: string; id: string; }[];
    metadata: { key: string; value: string; id: string; }[];
    expectedResponseStatus?: number;
    timeoutMs?: number;
}

// --- MOCK DATA GENERATION ---
const generateMockWebhook = (idSuffix: number): Webhook => {
    const statusOptions: ('Active' | 'Disabled' | 'Paused')[] = ['Active', 'Disabled', 'Paused'];
    const eventsOptions = ['transaction.created', 'payment.updated', 'user.created', 'user.updated', 'order.placed', 'invoice.paid', 'email.sent'];
    const selectedEvents = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => eventsOptions[Math.floor(Math.random() * eventsOptions.length)]);
    const secret = uuidv4().replace(/-/g, '').substring(0, 32);
    const authTypes: ('none' | 'basic' | 'bearer')[] = ['none', 'basic', 'bearer'];
    const authType = authTypes[Math.floor(Math.random() * authTypes.length)];

    return {
        id: `wh-${idSuffix}`,
        url: `https://api.example.com/hooks/service-${idSuffix}`,
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        events: selectedEvents.length > 0 ? Array.from(new Set(selectedEvents)) : ['*'],
        description: `Webhook for ${Math.random() > 0.5 ? 'critical' : 'analytical'} events related to service ${idSuffix}.`,
        secret: `whsec_${secret}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        updatedAt: new Date().toISOString(),
        lastEventSentAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
        deliveryMetrics: {
            totalAttempts: Math.floor(Math.random() * 1000000),
            successfulDeliveries: Math.floor(Math.random() * 990000) + 1000,
            failedDeliveries: Math.floor(Math.random() * 5000),
            avgLatencyMs: Math.floor(Math.random() * 300) + 50,
        },
        retryPolicy: {
            maxRetries: Math.floor(Math.random() * 5) + 3,
            initialIntervalSeconds: 60,
            multiplier: 2,
            maxIntervalSeconds: 3600,
        },
        headers: [
            { id: uuidv4(), key: 'Content-Type', value: 'application/json' },
            { id: uuidv4(), key: 'X-Request-ID', value: `req-${uuidv4()}` },
        ],
        authConfig: authType === 'basic' ? { type: 'basic', username: `user-${idSuffix}`, password: 'password123' } :
                    authType === 'bearer' ? { type: 'bearer', token: `sk_bearer_${uuidv4().replace(/-/g, '')}` } :
                    { type: 'none' },
        sslVerificationEnabled: Math.random() > 0.1,
        metadata: { 'project': `project-${Math.floor(Math.random() * 3) + 1}`, 'cost_center': `CC-${Math.floor(Math.random() * 100)}` },
        ownerId: `user-${Math.floor(Math.random() * 5) + 1}`,
        environment: Math.random() > 0.7 ? 'production' : (Math.random() > 0.5 ? 'staging' : 'development'),
        tags: Math.random() > 0.5 ? ['billing', 'payments'] : ['analytics', 'monitoring'],
    };
};

const generateMockEvent = (webhook: Webhook, idSuffix: number, isFailed?: boolean): WebhookEvent => {
    const eventTypes = webhook.events[0] === '*' ? ['transaction.created', 'payment.updated', 'user.created', 'order.placed'] : webhook.events;
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const status: 'Delivered' | 'Failed' | 'Pending' | 'Retrying' = isFailed ? 'Failed' : (Math.random() > 0.95 ? 'Failed' : 'Delivered');
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

    const attempts = [];
    let currentStatus: 'Success' | 'Failure' = 'Failure';
    for (let i = 1; i <= (status === 'Failed' ? Math.floor(Math.random() * 3) + 1 : 1); i++) {
        const attemptStatus = (i === (status === 'Delivered' ? 1 : 0) || (status === 'Failed' && i === webhook.retryPolicy.maxRetries)) ? (status === 'Delivered' ? 'Success' : 'Failure') : 'Failure';
        currentStatus = attemptStatus;
        attempts.push({
            attempt: i,
            status: attemptStatus,
            responseStatus: attemptStatus === 'Success' ? 200 : (Math.random() > 0.5 ? 500 : 408),
            responseText: attemptStatus === 'Success' ? 'OK' : (Math.random() > 0.5 ? 'Internal Server Error' : 'Gateway Timeout'),
            latencyMs: Math.floor(Math.random() * 500) + 100,
            timestamp: new Date(new Date(timestamp).getTime() + i * 10000).toISOString(),
            errorDetails: attemptStatus === 'Failure' ? (Math.random() > 0.5 ? 'Connection refused' : 'SSL handshake failed') : undefined,
        });
    }

    return {
        id: `evt-${idSuffix}`,
        webhookId: webhook.id,
        type: type,
        status: status,
        payload: {
            id: `payload_${uuidv4().substring(0, 8)}`,
            amount: Math.floor(Math.random() * 10000) / 100,
            currency: 'USD',
            userId: `user_${uuidv4().substring(0, 6)}`,
            timestamp: new Date().toISOString(),
        },
        error: status === 'Failed' ? (currentStatus === 'Failure' ? attempts[attempts.length - 1]?.errorDetails : undefined) : undefined,
        timestamp: timestamp,
        deliveryAttempts: attempts,
        externalRef: uuidv4().substring(0, 10),
        metadata: { 'correlationId': uuidv4() },
    };
};

const MOCK_WEBHOOKS_COUNT = 50;
const MOCK_EVENTS_COUNT = 1000;

const initialWebhooks: Webhook[] = Array.from({ length: MOCK_WEBHOOKS_COUNT }).map((_, i) => generateMockWebhook(i + 1));
const initialEvents: WebhookEvent[] = Array.from({ length: MOCK_EVENTS_COUNT }).map((_, i) => {
    const randomWebhook = initialWebhooks[Math.floor(Math.random() * initialWebhooks.length)];
    const isFailed = i % 5 === 0; // Roughly 20% failed events
    return generateMockEvent(randomWebhook, i + 1, isFailed);
});


const MOCK_API_KEYS: ApiKey[] = [
    { id: 'ak-1', name: 'Default App Key', key: 'sk_live_abc123... (masked)', createdAt: '2023-01-01T10:00:00Z', permissions: ['webhook:*', 'event:read', 'alert:write'], status: 'Active', lastUsedAt: '2024-07-20T14:30:00Z', createdBy: 'admin' },
    { id: 'ak-2', name: 'Analytics Service Key', key: 'sk_test_def456... (masked)', createdAt: '2023-03-15T11:00:00Z', expiresAt: '2025-03-15T11:00:00Z', permissions: ['event:read'], status: 'Active', createdBy: 'dev-team' },
    { id: 'ak-3', name: 'Revoked Key for Old Service', key: 'sk_live_ghi789... (masked)', createdAt: '2023-06-01T12:00:00Z', permissions: ['webhook:read'], status: 'Revoked', createdBy: 'admin' },
];

const MOCK_ALERT_RULES: AlertRule[] = [
    { id: 'ar-1', name: 'High Failure Rate (Global)', type: 'webhook_failure_rate', threshold: 5, durationMinutes: 10, status: 'Active', channels: [{ id: uuidv4(), type: 'email', recipient: 'devops@example.com' }, { id: uuidv4(), type: 'slack', recipient: '#alerts-webhooks' }], severity: 'High' },
    { id: 'ar-2', name: 'Endpoint Latency Spike (wh-1)', type: 'event_latency', threshold: 500, durationMinutes: 5, webhookId: initialWebhooks[0].id, status: 'Active', channels: [{ id: uuidv4(), type: 'slack', recipient: '#alerts-webhook-demobank' }], severity: 'Medium' },
    { id: 'ar-3', name: 'Prod Env 500 Errors', type: 'custom_metric', threshold: 10, durationMinutes: 15, status: 'Active', channels: [{ id: uuidv4(), type: 'pagerduty', recipient: 'critical-alerts' }], severity: 'Critical', metricPath: 'responseStatus', operator: 'gte' },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = Array.from({ length: 200 }).map((_, i) => {
    const actions = ['webhook.created', 'webhook.updated', 'webhook.deleted', 'api_key.created', 'api_key.revoked', 'settings.updated', 'alert_rule.created', 'event.replay'];
    const resourceTypes = ['webhook', 'api_key', 'settings', 'event', 'alert_rule'];
    const actor = Math.random() > 0.5 ? 'user_admin' : 'user_dev';
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const resourceId = uuidv4().substring(0, 8);
    const timestamp = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(); // Last 60 days
    const details = {
        action,
        resourceType,
        resourceId,
        change: Math.random() > 0.5 ? { 'oldValue': 'some', 'newValue': 'other' } : {},
    };
    return { id: `log-${i + 1}`, timestamp, actor, action, resourceType, resourceId, details, ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`, userAgent: `Mozilla/5.0 (${Math.random() > 0.5 ? 'Macintosh' : 'Windows'})` };
});

const MOCK_ANALYTICS_SUMMARY: AnalyticsSummary = {
    totalEndpoints: initialWebhooks.length,
    activeEndpoints: initialWebhooks.filter(w => w.status === 'Active').length,
    disabledEndpoints: initialWebhooks.filter(w => w.status === 'Disabled').length,
    totalEventsDelivered24h: 1_500_000,
    failureRate24h: 0.2, // 0.2%
    avgLatencyMs24h: 120,
    pendingEvents: 1234,
    retryingEvents: 567,
    topFailedEndpoints: initialWebhooks.filter(w => w.deliveryMetrics.failedDeliveries > 100).sort((a, b) => b.deliveryMetrics.failedDeliveries - a.deliveryMetrics.failedDeliveries).slice(0, 5).map(w => ({ id: w.id, url: w.url, failures: w.deliveryMetrics.failedDeliveries })),
    eventDistribution: [
        { type: 'transaction.created', count: 700000 },
        { type: 'payment.updated', count: 300000 },
        { type: 'user.created', count: 200000 },
        { type: 'user.updated', count: 250000 },
        { type: 'order.placed', count: 50000 },
    ],
    latencyP99Ms: 450,
    totalEventsProcessedMonth: 30_000_000,
    successfulEventsMonth: 29_500_000,
    failedEventsMonth: 500_000,
};

const generateRandomChartData = (numPoints: number, min: number, max: number, interval: 'hourly' | 'daily'): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    for (let i = 0; i < numPoints; i++) {
        let timeLabel: string;
        if (interval === 'hourly') {
            timeLabel = `${String(i).padStart(2, '0')}:00`;
        } else { // daily
            const date = new Date();
            date.setDate(date.getDate() - (numPoints - 1 - i));
            timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        data.push({
            time: timeLabel,
            value: Math.floor(Math.random() * (max - min + 1)) + min,
        });
    }
    return data;
};

const MOCK_CHART_CONFIGS: ChartConfig[] = [
    {
        id: 'daily-failures',
        title: 'Daily Event Failures (Last 30 Days)',
        type: 'line',
        data: generateRandomChartData(30, 100, 2000, 'daily'),
        unit: 'events',
        timeframe: 'daily',
        description: 'Trend of failed webhook deliveries over the last 30 days.'
    },
    {
        id: 'hourly-latency',
        title: 'Avg. Latency (Last 24 Hours)',
        type: 'line',
        data: generateRandomChartData(24, 50, 400, 'hourly'),
        unit: 'ms',
        timeframe: 'hourly',
        description: 'Average latency for all webhook deliveries in milliseconds.'
    },
    {
        id: 'event-throughput',
        title: 'Total Events Processed (Last 30 Days)',
        type: 'bar',
        data: generateRandomChartData(30, 10000, 100000, 'daily'),
        unit: 'events',
        timeframe: 'daily',
        description: 'Total number of webhook events processed, including successful and failed deliveries.'
    },
    {
        id: 'success-failure-pie',
        title: 'Event Delivery Status (Last 24h)',
        type: 'pie',
        data: [
            { time: 'Delivered', value: MOCK_ANALYTICS_SUMMARY.totalEventsDelivered24h - (MOCK_ANALYTICS_SUMMARY.totalEventsDelivered24h * MOCK_ANALYTICS_SUMMARY.failureRate24h / 100), label: 'Delivered', color: '#34D399' },
            { time: 'Failed', value: MOCK_ANALYTICS_SUMMARY.totalEventsDelivered24h * MOCK_ANALYTICS_SUMMARY.failureRate24h / 100, label: 'Failed', color: '#EF4444' }
        ],
        unit: '%',
        timeframe: 'daily',
        description: 'Distribution of successful and failed webhook deliveries.'
    },
    {
        id: 'top-event-types',
        title: 'Top Event Types (Last 24h)',
        type: 'bar',
        data: MOCK_ANALYTICS_SUMMARY.eventDistribution.sort((a,b) => b.count - a.count).slice(0,5).map(e => ({time: e.type, value: e.count})),
        unit: 'events',
        timeframe: 'daily',
        description: 'Most frequently triggered webhook event types.'
    }
];

const DEFAULT_WEBHOOK_SETTINGS: WebhookSettings = {
    maxRetries: 5,
    retryIntervalSeconds: [60, 300, 900, 1800, 3600],
    timeoutMs: 10000,
    secretSigningEnabled: true,
    deliveryAttemptsLoggingEnabled: true,
    defaultHeaders: [{ id: uuidv4(), key: 'X-App-Id', value: 'megadashboard' }],
    ipWhitelist: ['0.0.0.0/0'], // Allow all by default
    rateLimitEnabled: false,
    rateLimitRequestsPerMinute: 1000,
    eventTransformationEnabled: false,
    customCertsEnabled: false,
    customCertificates: [],
    deadLetterQueueEnabled: false,
    globalMonitoringEnabled: true,
    webhookBatchingEnabled: false,
};

// --- HELPER FUNCTIONS (Mock API Calls & Utilities) ---

// Utility function for simulating API calls
const simulateApiCall = <T>(data: T, delay = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

const getPaginatedData = <T>(data: T[], page: number, itemsPerPage: number): { data: T[]; pagination: PaginationInfo; } => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    return {
        data: paginatedData,
        pagination: {
            currentPage: page,
            itemsPerPage: itemsPerPage,
            totalItems: data.length,
            totalPages: Math.ceil(data.length / itemsPerPage),
        },
    };
};

const filterWebhooks = (webhooks: Webhook[], filters: FilterOptions): Webhook[] => {
    let filtered = webhooks;
    if (filters.searchTerm) {
        const lowerCaseSearch = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(wh =>
            wh.url.toLowerCase().includes(lowerCaseSearch) ||
            wh.description.toLowerCase().includes(lowerCaseSearch) ||
            wh.events.some(e => e.toLowerCase().includes(lowerCaseSearch)) ||
            wh.tags.some(t => t.toLowerCase().includes(lowerCaseSearch))
        );
    }
    if (filters.status && filters.status !== 'All') {
        filtered = filtered.filter(wh => wh.status === filters.status);
    }
    if (filters.eventType && filters.eventType !== 'All') {
        filtered = filtered.filter(wh => wh.events.includes(filters.eventType!));
    }
    return filtered;
};

const filterEvents = (events: WebhookEvent[], filters: FilterOptions): WebhookEvent[] => {
    let filtered = events;
    if (filters.searchTerm) {
        const lowerCaseSearch = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(evt =>
            evt.type.toLowerCase().includes(lowerCaseSearch) ||
            JSON.stringify(evt.payload).toLowerCase().includes(lowerCaseSearch) ||
            evt.error?.toLowerCase().includes(lowerCaseSearch) ||
            evt.id.toLowerCase().includes(lowerCaseSearch)
        );
    }
    if (filters.status && filters.status !== 'All') {
        filtered = filtered.filter(evt => evt.status === filters.status);
    }
    if (filters.eventType && filters.eventType !== 'All') {
        filtered = filtered.filter(evt => evt.type === filters.eventType);
    }
    // TODO: Implement time range filtering if necessary for real app
    return filtered;
};

const filterAuditLogs = (logs: AuditLogEntry[], filters: FilterOptions): AuditLogEntry[] => {
    let filtered = logs;
    if (filters.searchTerm) {
        const lowerCaseSearch = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(log =>
            log.action.toLowerCase().includes(lowerCaseSearch) ||
            log.actor.toLowerCase().includes(lowerCaseSearch) ||
            log.resourceId.toLowerCase().includes(lowerCaseSearch) ||
            JSON.stringify(log.details).toLowerCase().includes(lowerCaseSearch)
        );
    }
    if (filters.resourceType && filters.resourceType !== 'All') {
        filtered = filtered.filter(log => log.resourceType === filters.resourceType);
    }
    if (filters.actor && filters.actor !== 'All') {
        filtered = filtered.filter(log => log.actor === filters.actor);
    }
    return filtered.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateUUID = () => uuidv4();

// --- Main WebhooksView Component ---
const WebhookSimulator: React.FC = () => {
    // --- State Management for different sections ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'endpoints' | 'events' | 'alerts' | 'api-keys' | 'settings' | 'audit-log' | 'testing'>('dashboard');

    // Webhooks State
    const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks);
    const [currentWebhookPage, setCurrentWebhookPage] = useState(1);
    const [webhooksPerPage] = useState(10);
    const [webhookFilters, setWebhookFilters] = useState<FilterOptions>({});
    const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<WebhookFormData | null>(null);
    const [webhookFormErrors, setWebhookFormErrors] = useState<any>({});
    const [showDeleteWebhookConfirm, setShowDeleteWebhookConfirm] = useState<string | null>(null); // Webhook ID to delete
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

    // Events State
    const [events, setEvents] = useState<WebhookEvent[]>(initialEvents);
    const [currentEventPage, setCurrentEventPage] = useState(1);
    const [eventsPerPage] = useState(20);
    const [eventFilters, setEventFilters] = useState<FilterOptions>({});
    const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
    const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);

    // AI Analysis State
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiAlertSuggestion, setAiAlertSuggestion] = useState<any>(null);
    const [isAiSuggesting, setIsAiSuggesting] = useState(false);
    const [aiPayloadDescription, setAiPayloadDescription] = useState('');
    const [isAiPayloadGenerating, setIsAiPayloadGenerating] = useState(false);
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

    // Alerts State
    const [alertRules, setAlertRules] = useState<AlertRule[]>(MOCK_ALERT_RULES);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [editingAlertRule, setEditingAlertRule] = useState<AlertRule | null>(null);
    const [alertFormErrors, setAlertFormErrors] = useState<any>({});
    const [showDeleteAlertConfirm, setShowDeleteAlertConfirm] = useState<string | null>(null);

    // API Keys State
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const [newApiKeyFormData, setNewApiKeyFormData] = useState<{ name: string; permissions: string[]; expiresAt?: string; }>({ name: '', permissions: ['event:read'] });
    const [newApiKeyDisplay, setNewApiKeyDisplay] = useState<string | null>(null); // To show generated key once
    const [showRevokeApiKeyConfirm, setShowRevokeApiKeyConfirm] = useState<string | null>(null);

    // Global Settings State
    const [webhookSettings, setWebhookSettings] = useState<WebhookSettings>(DEFAULT_WEBHOOK_SETTINGS);
    const [isSettingsLoading, setIsSettingsLoading] = useState(false);
    const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

    // Audit Log State
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
    const [currentAuditLogPage, setCurrentAuditLogPage] = useState(1);
    const [auditLogsPerPage] = useState(15);
    const [auditLogFilters, setAuditLogFilters] = useState<FilterOptions>({});

    // Analytics State
    const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary>(MOCK_ANALYTICS_SUMMARY);
    const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>(MOCK_CHART_CONFIGS);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

    // Webhook Testing State
    const [testEventConfig, setTestEventConfig] = useState<TestEventConfig>({ eventType: 'test.event', payload: { test: 'data' }, headers: [], metadata: [] });
    const [testResult, setTestResult] = useState<any>(null);
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [testEventErrors, setTestEventErrors] = useState<any>({});
    const [testHeaders, setTestHeaders] = useState<{ key: string; value: string; id: string; }[]>([]);
    const [testMetadata, setTestMetadata] = useState<{ key: string; value: string; id: string; }[]>([]);

    // Event Replay State
    const [eventReplayConfig, setEventReplayConfig] = useState<EventReplayConfig>({
        webhookIds: [],
        eventTypes: ['*'],
        dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
        maxEvents: 100,
        batchSize: 10,
        dryRun: true,
    });
    const [replayResults, setReplayResults] = useState<any>(null);
    const [isReplayLoading, setIsReplayLoading] = useState(false);
    const [eventReplayErrors, setEventReplayErrors] = useState<any>({});

    // UI Feedback
    const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string; } | null>(null);

    // Ref for the main content scroll, to ensure scroll on tab change
    const mainContentRef = useRef<HTMLDivElement>(null);

    // --- Effects & Data Fetching (Mocked) ---
    useEffect(() => {
        // Scroll to top when tab changes
        mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setFeedbackMessage(null); // Clear feedback when tab changes
    }, [activeTab]);

    useEffect(() => {
        // Simulate initial data load
        setIsAnalyticsLoading(true);
        simulateApiCall(MOCK_ANALYTICS_SUMMARY, 700).then(data => {
            setAnalyticsSummary(data);
            setIsAnalyticsLoading(false);
        });
        simulateApiCall(MOCK_CHART_CONFIGS, 800).then(data => setChartConfigs(data));
        simulateApiCall(DEFAULT_WEBHOOK_SETTINGS, 600).then(data => setWebhookSettings(data));
        simulateApiCall(MOCK_ALERT_RULES, 500).then(data => setAlertRules(data));
        simulateApiCall(MOCK_API_KEYS, 400).then(data => setApiKeys(data));
        simulateApiCall(MOCK_AUDIT_LOGS, 600).then(data => setAuditLogs(data));

        // Load webhooks and events (already initialized, but simulate API)
        simulateApiCall(initialWebhooks, 300).then(data => setWebhooks(data));
        simulateApiCall(initialEvents, 300).then(data => setEvents(data));
    }, []);

    // Debounced search for webhooks and events
    const debouncedSetWebhookFilters = useCallback(
        debounce((filters: FilterOptions) => setWebhookFilters(filters), 300),
        []
    );
    const debouncedSetEventFilters = useCallback(
        debounce((filters: FilterOptions) => setEventFilters(filters), 300),
        []
    );
    const debouncedSetAuditLogFilters = useCallback(
        debounce((filters: FilterOptions) => setAuditLogFilters(filters), 300),
        []
    );

    // Filtered and paginated data for display
    const filteredWebhooks = useMemo(() => filterWebhooks(webhooks, webhookFilters), [webhooks, webhookFilters]);
    const { data: displayedWebhooks, pagination: webhookPagination } = useMemo(
        () => getPaginatedData(filteredWebhooks, currentWebhookPage, webhooksPerPage),
        [filteredWebhooks, currentWebhookPage, webhooksPerPage]
    );

    const filteredEvents = useMemo(() => filterEvents(events, eventFilters), [events, eventFilters]);
    const { data: displayedEvents, pagination: eventPagination } = useMemo(
        () => getPaginatedData(filteredEvents, currentEventPage, eventsPerPage),
        [filteredEvents, currentEventPage, eventsPerPage]
    );

    const filteredAuditLogs = useMemo(() => filterAuditLogs(auditLogs, auditLogFilters), [auditLogs, auditLogFilters]);
    const { data: displayedAuditLogs, pagination: auditLogPagination } = useMemo(
        () => getPaginatedData(filteredAuditLogs, currentAuditLogPage, auditLogsPerPage),
        [filteredAuditLogs, currentAuditLogPage, auditLogsPerPage]
    );

    // --- Handlers for Webhooks Management ---

    const handleCreateWebhook = (templateConfig: Partial<WebhookFormData> = {}) => {
        setEditingWebhook({
            url: '',
            events: ['*'],
            status: 'Active',
            description: '',
            secret: '',
            headers: [{ key: '', value: '', id: uuidv4() }],
            authType: 'none',
            sslVerificationEnabled: true,
            retryPolicy: { maxRetries: 5, initialIntervalSeconds: 60, multiplier: 2, maxIntervalSeconds: 3600 },
            metadata: [{ key: '', value: '', id: uuidv4() }],
            environment: 'development',
            tags: [],
            ...templateConfig,
        });
        setIsWebhookModalOpen(true);
        setWebhookFormErrors({});
    };

    const handleEditWebhook = (webhook: Webhook) => {
        setEditingWebhook({
            ...webhook,
            headers: webhook.headers.length > 0 ? webhook.headers : [{ key: '', value: '', id: uuidv4() }],
            metadata: Object.entries(webhook.metadata).map(([key, value]) => ({ key, value, id: uuidv4() }))
                .concat({ key: '', value: '', id: uuidv4() }), // Ensure there's always an empty row for new input
            authType: webhook.authConfig.type,
            authToken: webhook.authConfig.token,
            username: webhook.authConfig.username,
            password: webhook.authConfig.password, // This should never be shown unmasked in real UI
        });
        setIsWebhookModalOpen(true);
        setWebhookFormErrors({});
    };

    const validateWebhookForm = (formData: WebhookFormData) => {
        const errors: any = {};
        if (!formData.url) errors.url = 'URL is required.';
        else if (!/^https?:\/\/.+\..+/.test(formData.url)) errors.url = 'Invalid URL format.';
        if (formData.events.length === 0) errors.events = 'At least one event type or "*" is required.';
        if (formData.authType === 'basic' && (!formData.username || !formData.password)) errors.auth = 'Username and password required for Basic Auth.';
        if (formData.authType === 'bearer' && !formData.authToken) errors.auth = 'Bearer token is required.';
        return errors;
    };

    const handleSaveWebhook = async (formData: WebhookFormData) => {
        const errors = validateWebhookForm(formData);
        if (Object.keys(errors).length > 0) {
            setWebhookFormErrors(errors);
            setFeedbackMessage({ type: 'error', message: 'Please correct the form errors.' });
            return;
        }

        setIsWebhookModalOpen(false);
        setFeedbackMessage(null);

        const newWebhook: Webhook = {
            id: formData.id || generateUUID(),
            url: formData.url,
            status: formData.status,
            events: formData.events.filter(e => e.trim() !== ''),
            description: formData.description,
            secret: formData.secret || `whsec_${uuidv4().replace(/-/g, '').substring(0, 32)}`, // Generate if empty
            createdAt: formData.id ? webhooks.find(wh => wh.id === formData.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastEventSentAt: formData.id ? webhooks.find(wh => wh.id === formData.id)?.lastEventSentAt : undefined,
            deliveryMetrics: formData.id ? webhooks.find(wh => wh.id === formData.id)?.deliveryMetrics || { totalAttempts: 0, successfulDeliveries: 0, failedDeliveries: 0, avgLatencyMs: 0 } : { totalAttempts: 0, successfulDeliveries: 0, failedDeliveries: 0, avgLatencyMs: 0 },
            retryPolicy: formData.retryPolicy,
            headers: formData.headers.filter(h => h.key && h.value),
            authConfig: formData.authType === 'basic' ? { type: 'basic', username: formData.username, password: formData.password } :
                        formData.authType === 'bearer' ? { type: 'bearer', token: formData.authToken } :
                        { type: 'none' },
            sslVerificationEnabled: formData.sslVerificationEnabled,
            metadata: formData.metadata.filter(m => m.key && m.value).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
            ownerId: 'current_user', // In a real app, this would be dynamic
            environment: formData.environment,
            tags: formData.tags.filter(t => t.trim() !== ''),
        };

        if (formData.id) {
            // Update existing webhook
            await simulateApiCall(newWebhook);
            setWebhooks(prev => prev.map(wh => (wh.id === newWebhook.id ? newWebhook : wh)));
            setFeedbackMessage({ type: 'success', message: `Webhook '${newWebhook.url}' updated successfully!` });
            setAuditLogs(prev => [{
                id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
                action: 'webhook.updated', resourceType: 'webhook', resourceId: newWebhook.id,
                details: { old: editingWebhook, new: newWebhook }
            }, ...prev]);
        } else {
            // Create new webhook
            await simulateApiCall(newWebhook);
            setWebhooks(prev => [...prev, newWebhook]);
            setFeedbackMessage({ type: 'success', message: `Webhook '${newWebhook.url}' created successfully!` });
            setAuditLogs(prev => [{
                id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
                action: 'webhook.created', resourceType: 'webhook', resourceId: newWebhook.id,
                details: newWebhook
            }, ...prev]);
        }
        setEditingWebhook(null);
    };

    const handleDeleteWebhook = async (webhookId: string) => {
        setShowDeleteWebhookConfirm(null);
        setFeedbackMessage(null);
        await simulateApiCall(null);
        setWebhooks(prev => prev.filter(wh => wh.id !== webhookId));
        setFeedbackMessage({ type: 'success', message: 'Webhook deleted successfully.' });
        setAuditLogs(prev => [{
            id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
            action: 'webhook.deleted', resourceType: 'webhook', resourceId: webhookId,
            details: { id: webhookId }
        }, ...prev]);
    };

    const handleWebhookStatusChange = async (webhookId: string, newStatus: 'Active' | 'Disabled' | 'Paused') => {
        setFeedbackMessage(null);
        const updatedWebhook = webhooks.find(wh => wh.id === webhookId);
        if (updatedWebhook) {
            const newWebhook = { ...updatedWebhook, status: newStatus, updatedAt: new Date().toISOString() };
            await simulateApiCall(newWebhook);
            setWebhooks(prev => prev.map(wh => (wh.id === webhookId ? newWebhook : wh)));
            setFeedbackMessage({ type: 'success', message: `Webhook '${updatedWebhook.url}' status changed to '${newStatus}'.` });
            setAuditLogs(prev => [{
                id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
                action: 'webhook.status.changed', resourceType: 'webhook', resourceId: webhookId,
                details: { oldStatus: updatedWebhook.status, newStatus: newStatus }
            }, ...prev]);
        }
    };

    const handleWebhookFilterChange = (key: keyof FilterOptions, value: string) => {
        debouncedSetWebhookFilters({ ...webhookFilters, [key]: value });
        setCurrentWebhookPage(1); // Reset page on filter change
    };

    // --- Handlers for Event Log Viewer ---
    const handleEventDetailsClick = (event: WebhookEvent) => {
        setSelectedEvent(event);
        setIsEventDetailsModalOpen(true);
        setAiAnalysis('');
        setAiError('');
    };

    const handleAiAnalyze = async () => {
        if (!selectedEvent) return;
        setIsAiLoading(true);
        setAiAnalysis('');
        setAiError('');
        try {
            if (!geminiApiKey) {
                throw new Error("VITE_GEMINI_API_KEY is not defined. Cannot perform AI analysis.");
            }
            const ai = new GoogleGenerativeAI(geminiApiKey);
            const prompt = `Analyze a failed webhook delivery.
            - Event Type: "${selectedEvent.type}"
            - Final Error: "${selectedEvent.error || 'N/A'}"
            - Payload: ${JSON.stringify(selectedEvent.payload, null, 2)}
            - Delivery Attempts: ${JSON.stringify(selectedEvent.deliveryAttempts, null, 2)}
            
            Provide a structured analysis in JSON format. The format must be:
            {
              "likelyCause": "A brief explanation of the most probable reason for failure.",
              "confidence": "High | Medium | Low",
              "recommendedFix": "Specific, actionable steps to resolve the issue.",
              "impactAnalysis": "Potential impact of this failure on the system or user.",
              "preventativeMeasures": "Suggestions to prevent this issue from recurring."
            }
            Respond with ONLY the valid JSON object, without any surrounding text or markdown.`;
            const model = ai.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            setAiAnalysis(text);
        } catch (error: any) {
            console.error("AI Analysis Error:", error);
            const errorMessage = `Error generating AI analysis: ${error.message || 'Unknown error'}. Please check your API key and network connection.`;
            setAiError(errorMessage);
            setAiAnalysis(JSON.stringify({ error: errorMessage }, null, 2));
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleEventFilterChange = (key: keyof FilterOptions, value: string) => {
        debouncedSetEventFilters({ ...eventFilters, [key]: value });
        setCurrentEventPage(1);
    };

    const handleReplayEvent = async (eventId: string) => {
        setFeedbackMessage(null);
        setIsReplayLoading(true);
        const eventToReplay = events.find(e => e.id === eventId);
        if (!eventToReplay) {
            setFeedbackMessage({ type: 'error', message: 'Event not found for replay.' });
            setIsReplayLoading(false);
            return;
        }

        const newAttempt = {
            attempt: eventToReplay.deliveryAttempts.length + 1,
            status: Math.random() > 0.7 ? 'Success' : 'Failure',
            responseStatus: Math.random() > 0.7 ? 200 : 500,
            responseText: Math.random() > 0.7 ? 'Replayed Successfully' : 'Replay Failed: Server Error',
            latencyMs: Math.floor(Math.random() * 300) + 50,
            timestamp: new Date().toISOString(),
            errorDetails: Math.random() > 0.7 ? undefined : 'Simulated replay failure',
        };

        const updatedEvent: WebhookEvent = {
            ...eventToReplay,
            status: newAttempt.status === 'Success' ? 'Delivered' : 'Failed',
            deliveryAttempts: [...eventToReplay.deliveryAttempts, newAttempt],
            error: newAttempt.status === 'Failure' ? newAttempt.errorDetails : undefined,
            timestamp: new Date().toISOString(),
        };

        await simulateApiCall(updatedEvent);
        setEvents(prev => prev.map(evt => (evt.id === eventId ? updatedEvent : evt)));
        setFeedbackMessage({ type: 'success', message: `Event ${eventId} replayed. Status: ${newAttempt.status}` });
        setIsReplayLoading(false);
        setAuditLogs(prev => [{
            id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
            action: 'event.replayed', resourceType: 'event', resourceId: eventId,
            details: { newAttempt }
        }, ...prev]);
    };

    // --- Handlers for Alert Rules ---
    const handleCreateAlert = () => {
        setEditingAlertRule({
            id: generateUUID(), name: '', type: 'webhook_failure_rate', threshold: 1, durationMinutes: 5, status: 'Active', channels: [{ id: uuidv4(), type: 'email', recipient: '' }], severity: 'Medium'
        });
        setIsAlertModalOpen(true);
        setAlertFormErrors({});
    };

    const handleEditAlert = (rule: AlertRule) => {
        setEditingAlertRule(rule);
        setIsAlertModalOpen(true);
        setAlertFormErrors({});
    };

    const validateAlertForm = (formData: AlertRule) => {
        const errors: any = {};
        if (!formData.name) errors.name = 'Rule name is required.';
        if (!formData.threshold || formData.threshold <= 0) errors.threshold = 'Threshold must be a positive number.';
        if (!formData.durationMinutes || formData.durationMinutes <= 0) errors.durationMinutes = 'Duration must be a positive number.';
        if (formData.channels.some(c => !c.recipient)) errors.channels = 'All alert channels must have a recipient.';
        if (formData.type === 'custom_metric' && (!formData.metricPath || !formData.operator)) errors.customMetric = 'Metric path and operator are required for custom metrics.';
        return errors;
    };

    const handleSaveAlert = async (formData: AlertRule) => {
        const errors = validateAlertForm(formData);
        if (Object.keys(errors).length > 0) {
            setAlertFormErrors(errors);
            setFeedbackMessage({ type: 'error', message: 'Please correct the form errors.' });
            return;
        }

        setIsAlertModalOpen(false);
        setFeedbackMessage(null);
        await simulateApiCall(formData);
        if (alertRules.some(r => r.id === formData.id)) {
            setAlertRules(prev => prev.map(r => (r.id === formData.id ? formData : r)));
            setFeedbackMessage({ type: 'success', message: `Alert rule '${formData.name}' updated.` });
            setAuditLogs(prev => [{
                id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
                action: 'alert_rule.updated', resourceType: 'alert_rule', resourceId: formData.id,
                details: { old: editingAlertRule, new: formData }
            }, ...prev]);
        } else {
            setAlertRules(prev => [...prev, { ...formData, id: generateUUID() }]);
            setFeedbackMessage({ type: 'success', message: `Alert rule '${formData.name}' created.` });
            setAuditLogs(prev => [{
                id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
                action: 'alert_rule.created', resourceType: 'alert_rule', resourceId: formData.id,
                details: formData
            }, ...prev]);
        }
        setEditingAlertRule(null);
    };

    const handleDeleteAlert = async (ruleId: string) => {
        setShowDeleteAlertConfirm(null);
        setFeedbackMessage(null);
        await simulateApiCall(null);
        setAlertRules(prev => prev.filter(r => r.id !== ruleId));
        setFeedbackMessage({ type: 'success', message: 'Alert rule deleted.' });
        setAuditLogs(prev => [{
            id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
            action: 'alert_rule.deleted', resourceType: 'alert_rule', resourceId: ruleId,
            details: { id: ruleId }
        }, ...prev]);
    };

    // --- Handlers for API Key Management ---
    const handleCreateApiKey = () => {
        setIsApiKeyModalOpen(true);
        setNewApiKeyFormData({ name: '', permissions: ['event:read'] });
        setNewApiKeyDisplay(null);
    };

    const handleGenerateApiKey = async () => {
        setFeedbackMessage(null);
        if (!newApiKeyFormData.name) {
            setFeedbackMessage({ type: 'error', message: 'API Key name is required.' });
            return;
        }
        const generatedKey = `sk_live_${uuidv4().replace(/-/g, '')}`; // Simulate key generation
        const newKey: ApiKey = {
            id: generateUUID(),
            name: newApiKeyFormData.name,
            key: generatedKey, // Store unmasked for now, but mask in UI
            createdAt: new Date().toISOString(),
            expiresAt: newApiKeyFormData.expiresAt,
            permissions: newApiKeyFormData.permissions,
            status: 'Active',
            createdBy: 'current_user',
        };
        await simulateApiCall(newKey);
        setApiKeys(prev => [...prev, newKey]);
        setNewApiKeyDisplay(generatedKey);
        setFeedbackMessage({ type: 'success', message: 'API Key generated successfully! Please copy it now.' });
        setAuditLogs(prev => [{
            id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
            action: 'api_key.created', resourceType: 'api_key', resourceId: newKey.id,
            details: { name: newKey.name, permissions: newKey.permissions }
        }, ...prev]);
    };

    const handleRevokeApiKey = async (keyId: string) => {
        setShowRevokeApiKeyConfirm(null);
        setFeedbackMessage(null);
        const updatedKey = apiKeys.find(key => key.id === keyId);
        if (updatedKey) {
            const newKey = { ...updatedKey, status: 'Revoked', lastUsedAt: new Date().toISOString() }; // Simulate last used for revocation
            await simulateApiCall(newKey);
            setApiKeys(prev => prev.map(key => (key.id === keyId ? newKey : key)));
            setFeedbackMessage({ type: 'success', message: `API Key '${updatedKey.name}' revoked.` });
            setAuditLogs(prev => [{
                id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
                action: 'api_key.revoked', resourceType: 'api_key', resourceId: keyId,
                details: { name: updatedKey.name }
            }, ...prev]);
        }
    };

    // --- Handlers for Global Settings ---
    const handleSettingsChange = (key: keyof WebhookSettings, value: any) => {
        setWebhookSettings(prev => ({ ...prev, [key]: value }));
        setSettingsSaveSuccess(false);
    };

    const handleAddDefaultHeader = () => {
        setWebhookSettings(prev => ({
            ...prev,
            defaultHeaders: [...prev.defaultHeaders, { key: '', value: '', id: uuidv4() }]
        }));
        setSettingsSaveSuccess(false);
    };

    const handleUpdateDefaultHeader = (id: string, key: 'key' | 'value', val: string) => {
        setWebhookSettings(prev => ({
            ...prev,
            defaultHeaders: prev.defaultHeaders.map(h => h.id === id ? { ...h, [key]: val } : h)
        }));
        setSettingsSaveSuccess(false);
    };

    const handleRemoveDefaultHeader = (id: string) => {
        setWebhookSettings(prev => ({
            ...prev,
            defaultHeaders: prev.defaultHeaders.filter(h => h.id !== id)
        }));
        setSettingsSaveSuccess(false);
    };

    const handleSaveSettings = async () => {
        setIsSettingsLoading(true);
        setFeedbackMessage(null);
        // Clean up empty headers before saving
        const cleanedSettings = {
            ...webhookSettings,
            defaultHeaders: webhookSettings.defaultHeaders.filter(h => h.key && h.value),
            ipWhitelist: webhookSettings.ipWhitelist.filter(ip => ip.trim() !== ''),
        };
        await simulateApiCall(cleanedSettings);
        setWebhookSettings(cleanedSettings); // Update state with cleaned settings
        setIsSettingsLoading(false);
        setSettingsSaveSuccess(true);
        setFeedbackMessage({ type: 'success', message: 'Global settings updated successfully!' });
        setAuditLogs(prev => [{
            id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
            action: 'settings.updated', resourceType: 'settings', resourceId: 'global',
            details: { newSettings: cleanedSettings }
        }, ...prev]);
    };

    // --- Handlers for Audit Log ---
    const handleAuditLogFilterChange = (key: keyof FilterOptions, value: string) => {
        debouncedSetAuditLogFilters({ ...auditLogFilters, [key]: value });
        setCurrentAuditLogPage(1);
    };

    // --- Handlers for Webhook Testing Tool ---
    const handleTestEventConfigChange = (key: keyof TestEventConfig, value: any) => {
        setTestEventConfig(prev => ({ ...prev, [key]: value }));
        setTestEventErrors({});
    };

    const handleTestHeadersChange = (id: string, key: 'key' | 'value', value: string) => {
        setTestHeaders(prev => prev.map(h => h.id === id ? { ...h, [key]: value } : h));
    };
    const handleAddTestHeader = () => {
        setTestHeaders(prev => [...prev, { id: uuidv4(), key: '', value: '' }]);
    };
    const handleRemoveTestHeader = (id: string) => {
        setTestHeaders(prev => prev.filter(h => h.id !== id));
    };

    const handleTestMetadataChange = (id: string, key: 'key' | 'value', value: string) => {
        setTestMetadata(prev => prev.map(m => m.id === id ? { ...m, [key]: value } : m));
    };
    const handleAddTestMetadata = () => {
        setTestMetadata(prev => [...prev, { id: uuidv4(), key: '', value: '' }]);
    };
    const handleRemoveTestMetadata = (id: string) => {
        setTestMetadata(prev => prev.filter(m => m.id !== id));
    };

    const handleSendTestEvent = async () => {
        setFeedbackMessage(null);
        setTestEventErrors({});
        setTestResult(null);
        setIsTestLoading(true);

        const errors: any = {};
        if (!testEventConfig.eventType) errors.eventType = 'Event Type is required.';
        try {
            JSON.parse(JSON.stringify(testEventConfig.payload)); // Validate JSON
        } catch (e) {
            errors.payload = 'Invalid JSON payload.';
        }
        if (Object.keys(errors).length > 0) {
            setTestEventErrors(errors);
            setIsTestLoading(false);
            setFeedbackMessage({ type: 'error', message: 'Please correct test event configuration errors.' });
            return;
        }

        const targetWebhook = testEventConfig.webhookId ? webhooks.find(wh => wh.id === testEventConfig.webhookId) : null;
        const simulatedResponseStatus = Math.random() > 0.8 ? 500 : 200;
        const simulatedLatency = Math.floor(Math.random() * 500) + 50;

        const result = {
            status: simulatedResponseStatus,
            message: simulatedResponseStatus === 200 ? 'Test event delivered successfully.' : 'Test event delivery failed.',
            latencyMs: simulatedLatency,
            webhookId: targetWebhook?.id || 'N/A',
            webhookUrl: targetWebhook?.url || 'All matching webhooks',
            payloadSent: testEventConfig.payload,
            headersSent: testHeaders.filter(h => h.key && h.value),
            deliveredAt: new Date().toISOString(),
            mockDetails: 'This is a simulated test webhook call. In a real system, you would see actual HTTP response data.',
        };
        await simulateApiCall(result);
        setTestResult(result);
        setIsTestLoading(false);
        setFeedbackMessage({ type: result.status === 200 ? 'success' : 'error', message: result.message });
        setAuditLogs(prev => [{
            id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
            action: 'webhook.tested', resourceType: 'webhook', resourceId: targetWebhook?.id || 'N/A',
            details: { eventType: testEventConfig.eventType, result }
        }, ...prev]);
    };

    // --- Handlers for Event Replay Tool ---
    const handleEventReplayConfigChange = (key: keyof EventReplayConfig, value: any) => {
        setEventReplayConfig(prev => ({ ...prev, [key]: value }));
        setEventReplayErrors({});
    };

    const handleInitiateEventReplay = async () => {
        setFeedbackMessage(null);
        setEventReplayErrors({});
        setReplayResults(null);
        setIsReplayLoading(true);

        const errors: any = {};
        if (eventReplayConfig.webhookIds.length === 0 && eventReplayConfig.eventTypes.length === 0) {
            errors.target = 'Select at least one webhook or event type.';
        }
        if (eventReplayConfig.maxEvents <= 0) errors.maxEvents = 'Max events must be positive.';
        if (Object.keys(errors).length > 0) {
            setEventReplayErrors(errors);
            setIsReplayLoading(false);
            setFeedbackMessage({ type: 'error', message: 'Please correct event replay configuration errors.' });
            return;
        }

        const eligibleEvents = events.filter(evt =>
            (eventReplayConfig.webhookIds.length === 0 || eventReplayConfig.webhookIds.includes(evt.webhookId)) &&
            (eventReplayConfig.eventTypes.includes('*') || eventReplayConfig.eventTypes.includes(evt.type)) &&
            (eventReplayConfig.statusFilter === 'All' || !eventReplayConfig.statusFilter || evt.status === eventReplayConfig.statusFilter) &&
            (new Date(evt.timestamp) >= new Date(eventReplayConfig.dateRange.start)) &&
            (new Date(evt.timestamp) <= new Date(eventReplayConfig.dateRange.end))
        ).slice(0, eventReplayConfig.maxEvents);

        const replayCount = eligibleEvents.length;
        let successCount = 0;
        let failureCount = 0;
        const replayedEvents = [];

        if (!eventReplayConfig.dryRun) {
            for (const evt of eligibleEvents) {
                const newAttempt = {
                    attempt: evt.deliveryAttempts.length + 1,
                    status: Math.random() > 0.85 ? 'Success' : 'Failure',
                    responseStatus: Math.random() > 0.85 ? 200 : 500,
                    responseText: Math.random() > 0.85 ? 'Replayed Successfully' : 'Replay Failed: Server Error',
                    latencyMs: Math.floor(Math.random() * 300) + 50,
                    timestamp: new Date().toISOString(),
                    errorDetails: Math.random() > 0.85 ? undefined : 'Simulated replay failure during batch operation',
                };
                if (newAttempt.status === 'Success') successCount++; else failureCount++;
                replayedEvents.push({ eventId: evt.id, status: newAttempt.status, attempt: newAttempt });
            }

            setEvents(prevEvents => {
                const updatedEventsMap = new Map(prevEvents.map(e => [e.id, e]));
                replayedEvents.forEach(replayed => {
                    const originalEvent = updatedEventsMap.get(replayed.eventId);
                    if (originalEvent) {
                        updatedEventsMap.set(replayed.eventId, {
                            ...originalEvent,
                            status: replayed.status === 'Success' ? 'Delivered' : 'Failed',
                            deliveryAttempts: [...originalEvent.deliveryAttempts, replayed.attempt],
                            error: replayed.status === 'Failure' ? replayed.attempt.errorDetails : undefined,
                            timestamp: new Date().toISOString(),
                        });
                    }
                });
                return Array.from(updatedEventsMap.values());
            });
        }

        const result = {
            dryRun: eventReplayConfig.dryRun,
            eventsFound: eligibleEvents.length,
            eventsReplayed: eventReplayConfig.dryRun ? 0 : replayCount,
            successfulReplays: eventReplayConfig.dryRun ? 0 : successCount,
            failedReplays: eventReplayConfig.dryRun ? 0 : failureCount,
            details: eventReplayConfig.dryRun ? [] : replayedEvents.map(r => ({ id: r.eventId, status: r.status })),
            message: eventReplayConfig.dryRun
                ? `Dry run completed. Found ${eligibleEvents.length} events matching criteria.`
                : `Replay completed. Successfully replayed ${successCount} events, failed to replay ${failureCount} events out of ${replayCount}.`,
        };
        await simulateApiCall(result);
        setReplayResults(result);
        setIsReplayLoading(false);
        setFeedbackMessage({ type: 'info', message: result.message });
        setAuditLogs(prev => [{
            id: generateUUID(), timestamp: new Date().toISOString(), actor: 'user_admin',
            action: 'event.bulkReplay', resourceType: 'event', resourceId: 'bulk',
            details: { config: eventReplayConfig, resultSummary: result }
        }, ...prev]);
    };


    // In a real application, these reusable components would be in their own files.
    // They are kept here for the purpose of a single-file response.

    // Pagination Component
    export const Pagination: React.FC<{ pagination: PaginationInfo; onPageChange: (page: number) => void; }> = ({ pagination, onPageChange }) => {
        const { currentPage, totalPages } = pagination;
        if (totalPages <= 1) return null;

        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <nav className="flex items-center justify-between pt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50">Previous</button>
                    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50">Next</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-400">
                            Showing <span className="font-medium">{(currentPage - 1) * pagination.itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50">
                                <span className="sr-only">First</span>
                                &laquo;
                            </button>
                            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50">
                                <span className="sr-only">Previous</span>
                                &lsaquo;
                            </button>
                            {pages.map(page => (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage ? 'z-10 bg-cyan-800 border-cyan-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50">
                                <span className="sr-only">Next</span>
                                &rsaquo;
                            </button>
                            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50">
                                <span className="sr-only">Last</span>
                                &raquo;
                            </button>
                        </nav>
                    </div>
                </div>
            </nav>
        );
    };

    // Form Field Row Component
    export const FormField: React.FC<{ label: string; children: React.ReactNode; error?: string; description?: string; htmlFor?: string; }> = ({ label, children, error, description, htmlFor }) => (
        <div className="flex flex-col gap-1">
            <label htmlFor={htmlFor} className="text-sm font-medium text-gray-300 flex items-center">
                {label}
                {description && <span className="ml-2 text-xs text-gray-500">{description}</span>}
            </label>
            {children}
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );

    // Dynamic List Editor (for headers, metadata, channels)
    export const DynamicKeyValueList: React.FC<{
        label: string;
        items: { key: string; value: string; id: string; }[];
        onItemChange: (id: string, key: 'key' | 'value', value: string) => void;
        onAddItem: () => void;
        onRemoveItem: (id: string) => void;
        keyPlaceholder?: string;
        valuePlaceholder?: string;
        addButtonText?: string;
        description?: string;
    }> = ({
        label, items, onItemChange, onAddItem, onRemoveItem,
        keyPlaceholder = 'Key', valuePlaceholder = 'Value', addButtonText = `Add ${label} item`, description
    }) => {
        return (
            <FormField label={label} description={description}>
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder={keyPlaceholder}
                                value={item.key}
                                onChange={(e) => onItemChange(item.id, 'key', e.target.value)}
                                className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                            />
                            <input
                                type="text"
                                placeholder={valuePlaceholder}
                                value={item.value}
                                onChange={(e) => onItemChange(item.id, 'value', e.target.value)}
                                className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                className="text-red-400 hover:text-red-500 p-2 text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={onAddItem}
                        className="bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 px-4 py-2 rounded-md text-sm transition-colors duration-200"
                    >
                        {addButtonText}
                    </button>
                </div>
            </FormField>
        );
    };

    // Reusable Chart Component (replaces placeholder)
    export const AnalyticsChart: React.FC<ChartConfig> = ({ title, type, data, unit, description }) => {
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: { color: '#D1D5DB' }
                },
                title: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) { label += `${context.parsed.y} ${unit || ''}`; }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } },
                y: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } }
            }
        };

        const chartData = {
            labels: data.map(d => d.time),
            datasets: [{
                label: title,
                data: data.map(d => d.value),
                borderColor: '#22D3EE',
                backgroundColor: 'rgba(34, 211, 238, 0.2)',
                fill: type === 'line',
                tension: 0.3,
                pointBackgroundColor: '#22D3EE',
                pointBorderColor: '#fff',
            }],
        };

        const pieData = {
            labels: data.map(d => d.label || d.time),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: data.map(d => d.color || '#22D3EE'),
                borderColor: '#1F2937',
                borderWidth: 2,
            }]
        };

        return (
            <Card title={title} className="col-span-1 lg:col-span-1">
                <div className="flex flex-col h-full">
                    <p className="text-sm text-gray-400 mb-2">{description}</p>
                    <div className="relative flex-grow h-64">
                        {type === 'line' && <Line options={options} data={chartData} />}
                        {type === 'bar' && <Bar options={options} data={chartData} />}
                        {type === 'pie' && <Pie options={{ ...options, scales: undefined }} data={pieData} />}
                    </div>
                </div>
            </Card>
        );
    };


    // --- Component JSX ---
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <header className="px-8 py-6 border-b border-gray-800">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">MegaDashboard Webhooks</h1>
                <p className="text-gray-400 mt-1 text-lg">Manage, monitor, and debug your webhook integrations.</p>
            </header>

            <div className="flex-grow flex">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-gray-800 border-r border-gray-700 p-6 flex-shrink-0">
                    <ul className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                            { id: 'endpoints', label: 'Endpoints', icon: '🔌' },
                            { id: 'events', label: 'Events Log', icon: '📜' },
                            { id: 'alerts', label: 'Alerts', icon: '🚨' },
                            { id: 'api-keys', label: 'API Keys', icon: '🔑' },
                            { id: 'settings', label: 'Global Settings', icon: '⚙️' },
                            { id: 'audit-log', label: 'Audit Log', icon: '📋' },
                            { id: 'testing', label: 'Developer Tools', icon: '🔬' },
                        ].map(item => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`flex items-center w-full px-4 py-2 rounded-md text-left text-sm font-medium transition-colors duration-200
                                        ${activeTab === item.id ? 'bg-cyan-700 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Main Content Area */}
                <main ref={mainContentRef} className="flex-grow p-8 overflow-y-auto space-y-6">
                    {feedbackMessage && (
                        <div className={`p-4 rounded-md text-sm font-medium ${feedbackMessage.type === 'success' ? 'bg-green-600 text-white' : feedbackMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {feedbackMessage.message}
                            <button onClick={() => setFeedbackMessage(null)} className="float-right text-white opacity-75 hover:opacity-100">&times;</button>
                        </div>
                    )}

                    {/* --- Dashboard Tab --- */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Dashboard Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-white">{analyticsSummary.activeEndpoints}</p>
                                    <p className="text-sm text-gray-400 mt-1">Active Endpoints</p>
                                    <p className="text-xs text-gray-500">of {analyticsSummary.totalEndpoints} total</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-white">{analyticsSummary.totalEventsDelivered24h.toLocaleString()}</p>
                                    <p className="text-sm text-gray-400 mt-1">Events Delivered (24h)</p>
                                    <p className="text-xs text-gray-500">{analyticsSummary.pendingEvents.toLocaleString()} pending</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-white">{analyticsSummary.failureRate24h}%</p>
                                    <p className="text-sm text-gray-400 mt-1">Failure Rate (24h)</p>
                                    <p className="text-xs text-gray-500">{analyticsSummary.retryingEvents.toLocaleString()} retrying</p>
                                </Card>
                                <Card className="text-center">
                                    <p className="text-3xl font-bold text-white">{analyticsSummary.avgLatencyMs24h}ms</p>
                                    <p className="text-sm text-gray-400 mt-1">Avg. Latency (24h)</p>
                                    <p className="text-xs text-gray-500">P99: {analyticsSummary.latencyP99Ms}ms</p>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {chartConfigs.map(chart => (
                                    <AnalyticsChart key={chart.id} {...chart} />
                                ))}
                            </div>

                            <Card title="Top 5 Failed Endpoints (24h)" className="col-span-2">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                        <tr>
                                            <th className="px-6 py-3">Endpoint URL</th>
                                            <th className="px-6 py-3 text-right">Failures</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsSummary.topFailedEndpoints.length === 0 ? (
                                            <tr><td colSpan={2} className="px-6 py-4 text-center text-gray-500">No failed endpoints in the last 24h.</td></tr>
                                        ) : (
                                            analyticsSummary.topFailedEndpoints.map(wh => (
                                                <tr key={wh.id} className="border-b border-gray-800 hover:bg-gray-800">
                                                    <td className="px-6 py-4 font-mono text-white">{wh.url}</td>
                                                    <td className="px-6 py-4 text-right text-red-400">{wh.failures.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    )}

                    {/* --- Endpoints Tab --- */}
                    {activeTab === 'endpoints' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider flex items-center justify-between">
                                Webhook Endpoints
                                <button onClick={handleCreateWebhook} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                    + Add New Webhook
                                </button>
                            </h2>

                            <Card className="p-4">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search URLs, descriptions, events..."
                                        className="flex-1 min-w-[200px] bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        onChange={(e) => handleWebhookFilterChange('searchTerm', e.target.value)}
                                    />
                                    <select
                                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                        onChange={(e) => handleWebhookFilterChange('status', e.target.value)}
                                        value={webhookFilters.status || 'All'}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Active">Active</option>
                                        <option value="Disabled">Disabled</option>
                                        <option value="Paused">Paused</option>
                                    </select>
                                    <select
                                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                        onChange={(e) => handleWebhookFilterChange('eventType', e.target.value)}
                                        value={webhookFilters.eventType || 'All'}
                                    >
                                        <option value="All">All Event Types</option>
                                        <option value="transaction.created">transaction.created</option>
                                        <option value="payment.updated">payment.updated</option>
                                        <option value="user.created">user.created</option>
                                        <option value="user.updated">user.updated</option>
                                        <option value="*">* (All Events)</option>
                                    </select>
                                </div>
                            </Card>

                            <Card title="Registered Webhooks">
                                {displayedWebhooks.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No webhooks found matching your criteria.</p>
                                ) : (
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                            <tr>
                                                <th className="px-6 py-3">URL</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Subscribed Events</th>
                                                <th className="px-6 py-3">Metrics (24h)</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedWebhooks.map(wh => (
                                                <tr key={wh.id} className="border-b border-gray-800 hover:bg-gray-800">
                                                    <td className="px-6 py-4 font-mono text-white text-xs max-w-xs truncate">{wh.url}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`${wh.status === 'Active' ? 'text-green-400' : wh.status === 'Disabled' ? 'text-gray-500' : 'text-yellow-400'} text-xs font-semibold`}>
                                                            {wh.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 flex flex-wrap gap-1 max-w-sm">
                                                        {wh.events.map(e => <span key={e} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{e}</span>)}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <p>Delivered: {wh.deliveryMetrics.successfulDeliveries.toLocaleString()}</p>
                                                        <p>Failed: <span className="text-red-400">{wh.deliveryMetrics.failedDeliveries.toLocaleString()}</span></p>
                                                        <p>Avg Latency: {wh.deliveryMetrics.avgLatencyMs}ms</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <button onClick={() => handleEditWebhook(wh)} className="text-cyan-400 hover:underline text-sm mr-4">Edit</button>
                                                        <div className="relative inline-block text-left">
                                                            <select
                                                                className="bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 p-1"
                                                                value={wh.status}
                                                                onChange={(e) => handleWebhookStatusChange(wh.id, e.target.value as 'Active' | 'Disabled' | 'Paused')}
                                                            >
                                                                <option value="Active">Active</option>
                                                                <option value="Paused">Pause</option>
                                                                <option value="Disabled">Disable</option>
                                                            </select>
                                                        </div>
                                                        <button onClick={() => setShowDeleteWebhookConfirm(wh.id)} className="text-red-400 hover:underline text-sm ml-4">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                <Pagination pagination={webhookPagination} onPageChange={setCurrentWebhookPage} />
                            </Card>
                        </div>
                    )}

                    {/* Webhook Editor Modal */}
                    {isWebhookModalOpen && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsWebhookModalOpen(false)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700">
                                    <h3 className="text-lg font-semibold text-white">{editingWebhook?.id ? 'Edit Webhook Endpoint' : 'Create New Webhook Endpoint'}</h3>
                                </div>
                                <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar" onSubmit={(e) => { e.preventDefault(); editingWebhook && handleSaveWebhook(editingWebhook); }}>
                                    <FormField label="Endpoint URL" htmlFor="url" error={webhookFormErrors.url}>
                                        <input
                                            id="url"
                                            type="url"
                                            value={editingWebhook?.url || ''}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, url: e.target.value } : null)}
                                            placeholder="https://your-app.com/webhook-listener"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            required
                                        />
                                    </FormField>

                                    <FormField label="Description" htmlFor="description">
                                        <textarea
                                            id="description"
                                            value={editingWebhook?.description || ''}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, description: e.target.value } : null)}
                                            placeholder="A brief description of this webhook's purpose."
                                            rows={2}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm resize-y"
                                        ></textarea>
                                    </FormField>

                                    <FormField label="Subscribed Events" description="Comma-separated list of event types (e.g., user.created, payment.succeeded) or '*' for all events." error={webhookFormErrors.events}>
                                        <input
                                            type="text"
                                            value={editingWebhook?.events.join(', ') || ''}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, events: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') } : null)}
                                            placeholder="*, transaction.created"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            required
                                        />
                                    </FormField>

                                    <FormField label="Status" htmlFor="status">
                                        <select
                                            id="status"
                                            value={editingWebhook?.status || 'Active'}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, status: e.target.value as 'Active' | 'Disabled' | 'Paused' } : null)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Disabled">Disabled</option>
                                            <option value="Paused">Paused</option>
                                        </select>
                                    </FormField>

                                    <FormField label="Secret for Signature Verification" description="Used to sign payloads for security. Leave empty to auto-generate." htmlFor="secret">
                                        <input
                                            id="secret"
                                            type="password" // Use password type for security in UI
                                            value={editingWebhook?.secret || ''}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, secret: e.target.value } : null)}
                                            placeholder="Optional: custom secret string"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        />
                                    </FormField>

                                    <DynamicKeyValueList
                                        label="Custom Headers"
                                        description="Add custom HTTP headers to be sent with each webhook request."
                                        items={editingWebhook?.headers || []}
                                        onItemChange={(id, key, value) => {
                                            setEditingWebhook(prev => prev ? { ...prev, headers: prev.headers.map(h => h.id === id ? { ...h, [key]: value } : h) } : null);
                                        }}
                                        onAddItem={() => {
                                            setEditingWebhook(prev => prev ? { ...prev, headers: [...prev.headers, { key: '', value: '', id: uuidv4() }] } : null);
                                        }}
                                        onRemoveItem={(id) => {
                                            setEditingWebhook(prev => prev ? { ...prev, headers: prev.headers.filter(h => h.id !== id) } : null);
                                        }}
                                        keyPlaceholder="Header-Key"
                                        valuePlaceholder="Header Value"
                                        addButtonText="Add Header"
                                    />

                                    <FormField label="Authentication Type" htmlFor="authType" error={webhookFormErrors.auth}>
                                        <select
                                            id="authType"
                                            value={editingWebhook?.authType || 'none'}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, authType: e.target.value as 'none' | 'basic' | 'bearer' } : null)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="none">None</option>
                                            <option value="basic">Basic Auth</option>
                                            <option value="bearer">Bearer Token</option>
                                        </select>
                                    </FormField>

                                    {editingWebhook?.authType === 'basic' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Username" htmlFor="authUsername">
                                                <input
                                                    id="authUsername"
                                                    type="text"
                                                    value={editingWebhook?.username || ''}
                                                    onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, username: e.target.value } : null)}
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                    required
                                                />
                                            </FormField>
                                            <FormField label="Password" htmlFor="authPassword">
                                                <input
                                                    id="authPassword"
                                                    type="password" // Use password type
                                                    value={editingWebhook?.password || ''} // In real app, this would be masked/re-entered
                                                    onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, password: e.target.value } : null)}
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                    required
                                                />
                                            </FormField>
                                        </div>
                                    )}

                                    {editingWebhook?.authType === 'bearer' && (
                                        <FormField label="Bearer Token" htmlFor="authToken">
                                            <input
                                                id="authToken"
                                                type="password" // Use password type
                                                value={editingWebhook?.authToken || ''} // In real app, this would be masked/re-entered
                                                onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, authToken: e.target.value } : null)}
                                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                required
                                            />
                                        </FormField>
                                    )}

                                    <FormField label="SSL Verification" description="Enable to verify SSL certificates of the endpoint URL. Recommended for production.">
                                        <label className="inline-flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                                checked={editingWebhook?.sslVerificationEnabled || false}
                                                onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, sslVerificationEnabled: e.target.checked } : null)}
                                            />
                                            <span className="ml-2 text-gray-300 text-sm">Verify SSL Certificate</span>
                                        </label>
                                    </FormField>

                                    <Card title="Retry Policy" className="p-4 bg-gray-800 border-gray-700">
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Max Retries">
                                                <input
                                                    type="number"
                                                    value={editingWebhook?.retryPolicy.maxRetries || 0}
                                                    onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, retryPolicy: { ...prev.retryPolicy, maxRetries: parseInt(e.target.value) } } : null)}
                                                    min="0"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                            <FormField label="Initial Interval (seconds)">
                                                <input
                                                    type="number"
                                                    value={editingWebhook?.retryPolicy.initialIntervalSeconds || 0}
                                                    onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, retryPolicy: { ...prev.retryPolicy, initialIntervalSeconds: parseInt(e.target.value) } } : null)}
                                                    min="0"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                            <FormField label="Multiplier">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={editingWebhook?.retryPolicy.multiplier || 0}
                                                    onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, retryPolicy: { ...prev.retryPolicy, multiplier: parseFloat(e.target.value) } } : null)}
                                                    min="1"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                            <FormField label="Max Interval (seconds)">
                                                <input
                                                    type="number"
                                                    value={editingWebhook?.retryPolicy.maxIntervalSeconds || 0}
                                                    onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, retryPolicy: { ...prev.retryPolicy, maxIntervalSeconds: parseInt(e.target.value) } } : null)}
                                                    min="0"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                        </div>
                                    </Card>

                                    <DynamicKeyValueList
                                        label="Metadata"
                                        description="Custom key-value pairs for internal categorization or tagging."
                                        items={editingWebhook?.metadata || []}
                                        onItemChange={(id, key, value) => {
                                            setEditingWebhook(prev => prev ? { ...prev, metadata: prev.metadata.map(m => m.id === id ? { ...m, [key]: value } : m) } : null);
                                        }}
                                        onAddItem={() => {
                                            setEditingWebhook(prev => prev ? { ...prev, metadata: [...prev.metadata, { key: '', value: '', id: uuidv4() }] } : null);
                                        }}
                                        onRemoveItem={(id) => {
                                            setEditingWebhook(prev => prev ? { ...prev, metadata: prev.metadata.filter(m => m.id !== id) } : null);
                                        }}
                                        keyPlaceholder="metadata-key"
                                        valuePlaceholder="metadata-value"
                                        addButtonText="Add Metadata"
                                    />

                                    <FormField label="Environment" htmlFor="environment">
                                        <select
                                            id="environment"
                                            value={editingWebhook?.environment || 'development'}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, environment: e.target.value as 'development' | 'staging' | 'production' } : null)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="development">Development</option>
                                            <option value="staging">Staging</option>
                                            <option value="production">Production</option>
                                        </select>
                                    </FormField>

                                    <FormField label="Tags" description="Comma-separated tags for organization.">
                                        <input
                                            type="text"
                                            value={editingWebhook?.tags.join(', ') || ''}
                                            onChange={(e) => setEditingWebhook(prev => prev ? { ...prev, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') } : null)}
                                            placeholder="billing, customer-service"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        />
                                    </FormField>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button type="button" onClick={() => setIsWebhookModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Cancel
                                        </button>
                                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            {editingWebhook?.id ? 'Save Changes' : 'Create Webhook'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Webhook Confirmation Modal */}
                    {showDeleteWebhookConfirm && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowDeleteWebhookConfirm(null)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Confirm Deletion</h3></div>
                                <div className="p-6">
                                    <p className="text-gray-300 mb-6">Are you sure you want to delete this webhook endpoint? This action cannot be undone.</p>
                                    <div className="flex justify-end space-x-3">
                                        <button type="button" onClick={() => setShowDeleteWebhookConfirm(null)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={() => handleDeleteWebhook(showDeleteWebhookConfirm)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Delete Permanently
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Events Log Tab --- */}
                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Recent Events Log</h2>

                            <Card className="p-4">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search by event type, payload, error..."
                                        className="flex-1 min-w-[200px] bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        onChange={(e) => handleEventFilterChange('searchTerm', e.target.value)}
                                    />
                                    <select
                                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                        onChange={(e) => handleEventFilterChange('status', e.target.value)}
                                        value={eventFilters.status || 'All'}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Retrying">Retrying</option>
                                    </select>
                                    <select
                                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                        onChange={(e) => handleEventFilterChange('eventType', e.target.value)}
                                        value={eventFilters.eventType || 'All'}
                                    >
                                        <option value="All">All Event Types</option>
                                        <option value="transaction.created">transaction.created</option>
                                        <option value="payment.updated">payment.updated</option>
                                        <option value="user.created">user.created</option>
                                        <option value="user.updated">user.updated</option>
                                        <option value="order.placed">order.placed</option>
                                    </select>
                                </div>
                            </Card>

                            <Card title="Recent Events">
                                {displayedEvents.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No events found matching your criteria.</p>
                                ) : (
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                            <tr>
                                                <th className="px-6 py-3">Timestamp</th>
                                                <th className="px-6 py-3">Webhook ID</th>
                                                <th className="px-6 py-3">Type</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedEvents.map(evt => (
                                                <tr key={evt.id} className="border-b border-gray-800 hover:bg-gray-800">
                                                    <td className="px-6 py-4 text-xs">{new Date(evt.timestamp).toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-mono text-white text-xs">{evt.webhookId}</td>
                                                    <td className="px-6 py-4 font-mono text-white text-xs">{evt.type}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`${evt.status === 'Delivered' ? 'text-green-400' : evt.status === 'Failed' ? 'text-red-400' : 'text-yellow-400'} text-xs font-semibold`}>
                                                            {evt.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <button onClick={() => handleEventDetailsClick(evt)} className="text-cyan-400 hover:underline text-sm mr-4">View Details</button>
                                                        {evt.status === 'Failed' && (
                                                            <button onClick={() => handleReplayEvent(evt.id)} className="text-purple-400 hover:underline text-sm disabled:opacity-50" disabled={isReplayLoading}>
                                                                {isReplayLoading ? 'Replaying...' : 'Replay'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                <Pagination pagination={eventPagination} onPageChange={setCurrentEventPage} />
                            </Card>
                        </div>
                    )}

                    {/* Event Details and AI Debugger Modal */}
                    {isEventDetailsModalOpen && selectedEvent && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsEventDetailsModalOpen(false)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-white">Event Details: {selectedEvent.id}</h3>
                                    <button onClick={() => setIsEventDetailsModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                                </div>
                                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <Card title="Event Summary">
                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                            <p><strong>Webhook ID:</strong> <span className="font-mono">{selectedEvent.webhookId}</span></p>
                                            <p><strong>Type:</strong> <span className="font-mono">{selectedEvent.type}</span></p>
                                            <p><strong>Status:</strong> <span className={`${selectedEvent.status === 'Delivered' ? 'text-green-400' : selectedEvent.status === 'Failed' ? 'text-red-400' : 'text-yellow-400'} font-semibold`}>{selectedEvent.status}</span></p>
                                            <p><strong>Timestamp:</strong> {new Date(selectedEvent.timestamp).toLocaleString()}</p>
                                            <p className="col-span-2"><strong>External Ref:</strong> {selectedEvent.externalRef || 'N/A'}</p>
                                            <p className="col-span-2"><strong>Metadata:</strong> <pre className="text-xs">{JSON.stringify(selectedEvent.metadata, null, 2)}</pre></p>
                                        </div>
                                    </Card>

                                    <Card title="Event Payload">
                                        <pre className="text-xs bg-gray-900 p-3 rounded-md overflow-x-auto text-white">{JSON.stringify(selectedEvent.payload, null, 2)}</pre>
                                    </Card>

                                    <Card title="Delivery Attempts">
                                        {selectedEvent.deliveryAttempts.length === 0 ? (
                                            <p className="text-sm text-gray-500">No delivery attempts recorded.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedEvent.deliveryAttempts.map((attempt, index) => (
                                                    <div key={index} className="border border-gray-700 rounded-md p-3 text-xs">
                                                        <p><strong>Attempt #{attempt.attempt}</strong> ({new Date(attempt.timestamp).toLocaleString()})</p>
                                                        <p>Status: <span className={`${attempt.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>{attempt.status}</span> (HTTP {attempt.responseStatus || 'N/A'})</p>
                                                        <p>Latency: {attempt.latencyMs}ms</p>
                                                        {attempt.errorDetails && <p className="text-red-400">Error: {attempt.errorDetails}</p>}
                                                        {attempt.responseText && <p>Response: <span className="truncate max-w-full inline-block">{attempt.responseText}</span></p>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>

                                    {selectedEvent.status === 'Failed' && (
                                        <Card title="AI Analysis for Failure">
                                            <pre className="text-xs bg-gray-900 p-3 rounded-md overflow-x-auto text-white">{isAiLoading ? 'Analyzing...' : aiError ? aiError : aiAnalysis ? JSON.stringify(JSON.parse(aiAnalysis), null, 2) : 'Click "Analyze" to get AI insights.'}</pre>
                                            <button onClick={handleAiAnalyze} disabled={isAiLoading || !geminiApiKey} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                                {isAiLoading ? 'Analyzing...' : 'Analyze with AI'}
                                            </button>
                                            {!geminiApiKey && <p className="text-yellow-500 text-xs mt-2">AI features disabled. Please set VITE_GEMINI_API_KEY in your environment.</p>}
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Alerts Tab --- */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider flex items-center justify-between">
                                Alert Rules
                                <button onClick={handleCreateAlert} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                    + Create New Alert
                                </button>
                            </h2>
                            <p className="text-gray-400">Configure rules to get notified about critical webhook events and performance issues.</p>

                            <Card title="Defined Alert Rules">
                                {alertRules.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No alert rules configured yet.</p>
                                ) : (
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                            <tr>
                                                <th className="px-6 py-3">Name</th>
                                                <th className="px-6 py-3">Type</th>
                                                <th className="px-6 py-3">Threshold</th>
                                                <th className="px-6 py-3">Scope</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alertRules.map(rule => (
                                                <tr key={rule.id} className="border-b border-gray-800 hover:bg-gray-800">
                                                    <td className="px-6 py-4 font-semibold text-white">{rule.name}</td>
                                                    <td className="px-6 py-4 text-xs font-mono">{rule.type.replace(/_/g, ' ')}</td>
                                                    <td className="px-6 py-4">{rule.threshold} / {rule.durationMinutes}min</td>
                                                    <td className="px-6 py-4 text-xs">{rule.webhookId ? `Webhook: ${rule.webhookId}` : 'Global'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`${rule.status === 'Active' ? 'text-green-400' : 'text-gray-500'} text-xs font-semibold`}>
                                                            {rule.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <button onClick={() => handleEditAlert(rule)} className="text-cyan-400 hover:underline text-sm mr-4">Edit</button>
                                                        <button onClick={() => setShowDeleteAlertConfirm(rule.id)} className="text-red-400 hover:underline text-sm">Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* Alert Rule Editor Modal */}
                    {isAlertModalOpen && editingAlertRule && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsAlertModalOpen(false)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700">
                                    <h3 className="text-lg font-semibold text-white">{editingAlertRule.id ? 'Edit Alert Rule' : 'Create New Alert Rule'}</h3>
                                </div>
                                <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar" onSubmit={(e) => { e.preventDefault(); handleSaveAlert(editingAlertRule); }}>
                                    <FormField label="Rule Name" htmlFor="alertName" error={alertFormErrors.name}>
                                        <input
                                            id="alertName"
                                            type="text"
                                            value={editingAlertRule.name}
                                            onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, name: e.target.value } : null)}
                                            placeholder="e.g., High Failure Rate in Production"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            required
                                        />
                                    </FormField>

                                    <FormField label="Alert Type" htmlFor="alertType">
                                        <select
                                            id="alertType"
                                            value={editingAlertRule.type}
                                            onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, type: e.target.value as AlertRule['type'] } : null)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="webhook_failure_rate">Webhook Failure Rate (%)</option>
                                            <option value="event_latency">Event Latency (ms)</option>
                                            <option value="delivery_success_rate">Delivery Success Rate (%)</option>
                                            <option value="endpoint_down">Endpoint Down</option>
                                            <option value="custom_metric">Custom Metric</option>
                                        </select>
                                    </FormField>

                                    {editingAlertRule.type === 'custom_metric' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Metric Path (JSONPath)" htmlFor="metricPath" error={alertFormErrors.customMetric}>
                                                <input
                                                    id="metricPath"
                                                    type="text"
                                                    value={editingAlertRule.metricPath || ''}
                                                    onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, metricPath: e.target.value } : null)}
                                                    placeholder="e.g., $.payload.amount, $.responseStatus"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                            <FormField label="Operator" htmlFor="operator" error={alertFormErrors.customMetric}>
                                                <select
                                                    id="operator"
                                                    value={editingAlertRule.operator || 'gt'}
                                                    onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, operator: e.target.value as AlertRule['operator'] } : null)}
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                >
                                                    <option value="gt">Greater Than ( > )</option>
                                                    <option value="lt">Less Than ( &lt; )</option>
                                                    <option value="eq">Equals ( = )</option>
                                                    <option value="gte">Greater Than or Equal ( >= )</option>
                                                    <option value="lte">Less Than or Equal ( &lt;= )</option>
                                                </select>
                                            </FormField>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Threshold Value" htmlFor="threshold" error={alertFormErrors.threshold}>
                                            <input
                                                id="threshold"
                                                type="number"
                                                step="0.1"
                                                value={editingAlertRule.threshold}
                                                onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, threshold: parseFloat(e.target.value) } : null)}
                                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                required
                                            />
                                        </FormField>
                                        <FormField label="Duration (minutes)" htmlFor="durationMinutes" error={alertFormErrors.durationMinutes}>
                                            <input
                                                id="durationMinutes"
                                                type="number"
                                                value={editingAlertRule.durationMinutes}
                                                onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, durationMinutes: parseInt(e.target.value) } : null)}
                                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                required
                                            />
                                        </FormField>
                                    </div>

                                    <FormField label="Scope (Optional)" description="Apply this rule to a specific webhook or globally." htmlFor="webhookId">
                                        <select
                                            id="webhookId"
                                            value={editingAlertRule.webhookId || ''}
                                            onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, webhookId: e.target.value || undefined } : null)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="">Global</option>
                                            {webhooks.map(wh => <option key={wh.id} value={wh.id}>{wh.url} ({wh.id})</option>)}
                                        </select>
                                    </FormField>

                                    <FormField label="Severity" htmlFor="severity">
                                        <select
                                            id="severity"
                                            value={editingAlertRule.severity}
                                            onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, severity: e.target.value as AlertRule['severity'] } : null)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </FormField>

                                    <FormField label="Status" htmlFor="alertStatus">
                                        <select
                                            id="alertStatus"
                                            value={editingAlertRule.status}
                                            onChange={(e) => setEditingAlertRule(prev => prev ? { ...prev, status: e.target.value as AlertRule['status'] } : null)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </FormField>

                                    <Card title="Notification Channels" className="bg-gray-800 border-gray-700">
                                        <p className="text-sm text-gray-400 mb-3">Configure where alerts should be sent.</p>
                                        {editingAlertRule.channels.map((channel, index) => (
                                            <div key={channel.id} className="flex items-center space-x-2 mb-2">
                                                <select
                                                    value={channel.type}
                                                    onChange={(e) => setEditingAlertRule(prev => prev ? {
                                                        ...prev, channels: prev.channels.map(c => c.id === channel.id ? { ...c, type: e.target.value as any } : c)
                                                    } : null)}
                                                    className="w-1/3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm"
                                                >
                                                    <option value="email">Email</option>
                                                    <option value="slack">Slack</option>
                                                    <option value="sms">SMS</option>
                                                    <option value="pagerduty">PagerDuty</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={channel.recipient}
                                                    onChange={(e) => setEditingAlertRule(prev => prev ? {
                                                        ...prev, channels: prev.channels.map(c => c.id === channel.id ? { ...c, recipient: e.target.value } : c)
                                                    } : null)}
                                                    placeholder={channel.type === 'email' ? 'email@example.com' : channel.type === 'slack' ? '#channel-name' : 'PagerDuty Key'}
                                                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingAlertRule(prev => prev ? { ...prev, channels: prev.channels.filter(c => c.id !== channel.id) } : null)}
                                                    className="text-red-400 hover:text-red-500 p-2 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        {alertFormErrors.channels && <p className="text-red-400 text-xs mt-1">{alertFormErrors.channels}</p>}
                                        <button
                                            type="button"
                                            onClick={() => setEditingAlertRule(prev => prev ? { ...prev, channels: [...prev.channels, { id: uuidv4(), type: 'email', recipient: '' }] } : null)}
                                            className="mt-3 bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 px-4 py-2 rounded-md text-sm transition-colors duration-200"
                                        >
                                            Add Channel
                                        </button>
                                    </Card>

                                    <div className="flex justify-end space-x-3 mt-6">
                                        <button type="button" onClick={() => setIsAlertModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Cancel
                                        </button>
                                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Save Alert Rule
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Alert Rule Confirmation Modal */}
                    {showDeleteAlertConfirm && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowDeleteAlertConfirm(null)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Confirm Deletion</h3></div>
                                <div className="p-6">
                                    <p className="text-gray-300 mb-6">Are you sure you want to delete this alert rule? This action cannot be undone.</p>
                                    <div className="flex justify-end space-x-3">
                                        <button type="button" onClick={() => setShowDeleteAlertConfirm(null)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={() => handleDeleteAlert(showDeleteAlertConfirm)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Delete Permanently
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- API Keys Tab --- */}
                    {activeTab === 'api-keys' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider flex items-center justify-between">
                                API Keys
                                <button onClick={handleCreateApiKey} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                    + Generate New Key
                                </button>
                            </h2>
                            <p className="text-gray-400">Manage API keys for programmatic access to your webhook platform. Keep your keys secure!</p>

                            <Card title="Your API Keys">
                                {apiKeys.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No API keys generated yet.</p>
                                ) : (
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                            <tr>
                                                <th className="px-6 py-3">Name</th>
                                                <th className="px-6 py-3">Key</th>
                                                <th className="px-6 py-3">Permissions</th>
                                                <th className="px-6 py-3">Status</th>
                                                <th className="px-6 py-3">Created At</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {apiKeys.map(key => (
                                                <tr key={key.id} className="border-b border-gray-800 hover:bg-gray-800">
                                                    <td className="px-6 py-4 font-semibold text-white">{key.name}</td>
                                                    <td className="px-6 py-4 font-mono text-xs">{key.key.substring(0, 10)}... (masked)</td>
                                                    <td className="px-6 py-4 flex flex-wrap gap-1 max-w-sm">
                                                        {key.permissions.map(p => <span key={p} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{p}</span>)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`${key.status === 'Active' ? 'text-green-400' : 'text-red-400'} text-xs font-semibold`}>
                                                            {key.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">{new Date(key.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        {key.status === 'Active' ? (
                                                            <button onClick={() => setShowRevokeApiKeyConfirm(key.id)} className="text-red-400 hover:underline text-sm">Revoke</button>
                                                        ) : (
                                                            <span className="text-gray-500 text-sm">Revoked</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* API Key Generation Modal */}
                    {isApiKeyModalOpen && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsApiKeyModalOpen(false)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700">
                                    <h3 className="text-lg font-semibold text-white">Generate New API Key</h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {!newApiKeyDisplay ? (
                                        <>
                                            <FormField label="Key Name" htmlFor="newApiKeyName">
                                                <input
                                                    id="newApiKeyName"
                                                    type="text"
                                                    value={newApiKeyFormData.name}
                                                    onChange={(e) => setNewApiKeyFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="e.g., My Integration Service Key"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                    required
                                                />
                                            </FormField>
                                            <FormField label="Permissions" description="Select required permissions for this API key.">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {['webhook:read', 'webhook:write', 'event:read', 'event:replay', 'alert:read', 'alert:write'].map(perm => (
                                                        <label key={perm} className="inline-flex items-center text-gray-300">
                                                            <input
                                                                type="checkbox"
                                                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                                                checked={newApiKeyFormData.permissions.includes(perm)}
                                                                onChange={(e) => {
                                                                    setNewApiKeyFormData(prev => ({
                                                                        ...prev,
                                                                        permissions: e.target.checked
                                                                            ? [...prev.permissions, perm]
                                                                            : prev.permissions.filter(p => p !== perm)
                                                                    }));
                                                                }}
                                                            />
                                                            <span className="ml-2">{perm}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </FormField>
                                            <FormField label="Expires At (Optional)" htmlFor="expiresAt">
                                                <input
                                                    id="expiresAt"
                                                    type="date"
                                                    value={newApiKeyFormData.expiresAt || ''}
                                                    onChange={(e) => setNewApiKeyFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                            <div className="flex justify-end space-x-3 mt-6">
                                                <button type="button" onClick={() => setIsApiKeyModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                                    Cancel
                                                </button>
                                                <button type="button" onClick={handleGenerateApiKey} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                                    Generate Key
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <Card title="New API Key Generated!">
                                            <p className="text-yellow-400 mb-3">Please copy this key now. It will not be shown again!</p>
                                            <pre className="bg-gray-900 p-3 rounded-md overflow-x-auto text-green-400 font-mono text-sm break-all">{newApiKeyDisplay}</pre>
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    onClick={() => { navigator.clipboard.writeText(newApiKeyDisplay); setFeedbackMessage({ type: 'success', message: 'API Key copied to clipboard!' }); }}
                                                    className="bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 px-4 py-2 rounded-md text-sm transition-colors duration-200"
                                                >
                                                    Copy to Clipboard
                                                </button>
                                                <button onClick={() => setIsApiKeyModalOpen(false)} className="ml-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                                    Done
                                                </button>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revoke API Key Confirmation Modal */}
                    {showRevokeApiKeyConfirm && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowRevokeApiKeyConfirm(null)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Confirm API Key Revocation</h3></div>
                                <div className="p-6">
                                    <p className="text-gray-300 mb-6">Are you sure you want to revoke this API key? This will immediately invalidate it and cannot be undone.</p>
                                    <div className="flex justify-end space-x-3">
                                        <button type="button" onClick={() => setShowRevokeApiKeyConfirm(null)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={() => handleRevokeApiKey(showRevokeApiKeyConfirm)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                                            Revoke Key
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- Global Settings Tab --- */}
                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Global Webhook Settings</h2>
                            <p className="text-gray-400">These settings apply to all webhooks unless overridden at the individual webhook level.</p>

                            <Card title="General Delivery Settings">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Max Retries" description="Maximum number of times to retry a failed webhook delivery.">
                                        <input
                                            type="number"
                                            value={webhookSettings.maxRetries}
                                            onChange={(e) => handleSettingsChange('maxRetries', parseInt(e.target.value))}
                                            min="0"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        />
                                    </FormField>
                                    <FormField label="Timeout (ms)" description="Maximum time to wait for a webhook endpoint to respond.">
                                        <input
                                            type="number"
                                            value={webhookSettings.timeoutMs}
                                            onChange={(e) => handleSettingsChange('timeoutMs', parseInt(e.target.value))}
                                            min="1000"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        />
                                    </FormField>
                                    <FormField label="Retry Intervals (seconds)" description="Comma-separated list of intervals for retry attempts (e.g., 60,300,900).">
                                        <input
                                            type="text"
                                            value={webhookSettings.retryIntervalSeconds.join(', ')}
                                            onChange={(e) => handleSettingsChange('retryIntervalSeconds', e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        />
                                    </FormField>
                                    <FormField label="Secret Signing" description="Enable cryptographic signing of webhook payloads for enhanced security.">
                                        <label className="inline-flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                                checked={webhookSettings.secretSigningEnabled}
                                                onChange={(e) => handleSettingsChange('secretSigningEnabled', e.target.checked)}
                                            />
                                            <span className="ml-2 text-gray-300 text-sm">Enable Secret Signing</span>
                                        </label>
                                    </FormField>
                                    <FormField label="Delivery Attempts Logging" description="Log details for each attempt of a webhook delivery.">
                                        <label className="inline-flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                                checked={webhookSettings.deliveryAttemptsLoggingEnabled}
                                                onChange={(e) => handleSettingsChange('deliveryAttemptsLoggingEnabled', e.target.checked)}
                                            />
                                            <span className="ml-2 text-gray-300 text-sm">Enable Detailed Logging</span>
                                        </label>
                                    </FormField>
                                    <FormField label="Global Monitoring" description="Enable overall system health monitoring for webhooks.">
                                        <label className="inline-flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                                checked={webhookSettings.globalMonitoringEnabled}
                                                onChange={(e) => handleSettingsChange('globalMonitoringEnabled', e.target.checked)}
                                            />
                                            <span className="ml-2 text-gray-300 text-sm">Enable Global Monitoring</span>
                                        </label>
                                    </FormField>
                                </div>
                            </Card>

                            <Card title="Network & Security Settings">
                                <DynamicKeyValueList
                                    label="Default Headers"
                                    description="Headers added to all webhook requests by default."
                                    items={webhookSettings.defaultHeaders}
                                    onItemChange={handleUpdateDefaultHeader}
                                    onAddItem={handleAddDefaultHeader}
                                    onRemoveItem={handleRemoveDefaultHeader}
                                    keyPlaceholder="Header-Key"
                                    valuePlaceholder="Header Value"
                                    addButtonText="Add Default Header"
                                />

                                <FormField label="IP Whitelist (CIDR)" description="Only allow webhooks to be sent to these IP ranges. Comma-separated (e.g., 192.168.1.0/24, 10.0.0.1).">
                                    <textarea
                                        value={webhookSettings.ipWhitelist.join(', ')}
                                        onChange={(e) => handleSettingsChange('ipWhitelist', e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip !== ''))}
                                        rows={3}
                                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm resize-y"
                                    ></textarea>
                                </FormField>

                                <FormField label="Rate Limiting" description="Prevent sending too many requests to an endpoint within a given time frame.">
                                    <label className="inline-flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                            checked={webhookSettings.rateLimitEnabled}
                                            onChange={(e) => handleSettingsChange('rateLimitEnabled', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-300 text-sm">Enable Global Rate Limiting</span>
                                    </label>
                                    {webhookSettings.rateLimitEnabled && (
                                        <div className="mt-2">
                                            <FormField label="Requests Per Minute">
                                                <input
                                                    type="number"
                                                    value={webhookSettings.rateLimitRequestsPerMinute}
                                                    onChange={(e) => handleSettingsChange('rateLimitRequestsPerMinute', parseInt(e.target.value))}
                                                    min="1"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                        </div>
                                    )}
                                </FormField>

                                <FormField label="Custom Certificates" description="Upload custom SSL/TLS certificates for endpoints requiring client authentication.">
                                    <label className="inline-flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                            checked={webhookSettings.customCertsEnabled}
                                            onChange={(e) => handleSettingsChange('customCertsEnabled', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-300 text-sm">Enable Custom Certificates</span>
                                    </label>
                                    {webhookSettings.customCertsEnabled && (
                                        <div className="mt-2 space-y-2">
                                            {/* Simplified for demo; in real app, this would involve file uploads and certificate management */}
                                            {webhookSettings.customCertificates.map(cert => (
                                                <div key={cert.id} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                                                    <span className="text-sm text-white flex-1">{cert.name} (Expires: {new Date(cert.expiration).toLocaleDateString()})</span>
                                                    <button className="text-red-400 text-xs hover:underline">Remove</button>
                                                </div>
                                            ))}
                                            <button className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm">Upload New Certificate</button>
                                        </div>
                                    )}
                                </FormField>
                            </Card>

                            <Card title="Advanced Settings">
                                <FormField label="Event Transformation" description="Enable global payload transformation rules before sending to any webhook.">
                                    <label className="inline-flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                            checked={webhookSettings.eventTransformationEnabled}
                                            onChange={(e) => handleSettingsChange('eventTransformationEnabled', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-300 text-sm">Enable Event Transformation</span>
                                    </label>
                                    {webhookSettings.eventTransformationEnabled && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>This would typically link to a dedicated editor for defining JmesPath or custom scripting rules.</p>
                                            <button className="text-cyan-400 hover:underline mt-1">Configure Transformation Rules</button>
                                        </div>
                                    )}
                                </FormField>

                                <FormField label="Dead Letter Queue (DLQ)" description="Route failed or undeliverable events to a DLQ for later inspection.">
                                    <label className="inline-flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                            checked={webhookSettings.deadLetterQueueEnabled}
                                            onChange={(e) => handleSettingsChange('deadLetterQueueEnabled', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-300 text-sm">Enable Dead Letter Queue</span>
                                    </label>
                                    {webhookSettings.deadLetterQueueEnabled && (
                                        <div className="mt-2 space-y-2">
                                            <FormField label="DLQ Type">
                                                <select
                                                    value={webhookSettings.deadLetterQueueConfig?.type || 's3'}
                                                    onChange={(e) => handleSettingsChange('deadLetterQueueConfig', { ...webhookSettings.deadLetterQueueConfig, type: e.target.value as 's3' | 'kafka' })}
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                >
                                                    <option value="s3">Amazon S3</option>
                                                    <option value="kafka">Apache Kafka</option>
                                                </select>
                                            </FormField>
                                            <FormField label="Target (Bucket/Topic Name)">
                                                <input
                                                    type="text"
                                                    value={webhookSettings.deadLetterQueueConfig?.target || ''}
                                                    onChange={(e) => handleSettingsChange('deadLetterQueueConfig', { ...webhookSettings.deadLetterQueueConfig, target: e.target.value })}
                                                    placeholder="my-dlq-bucket or my-dlq-topic"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                        </div>
                                    )}
                                </FormField>

                                <FormField label="Webhook Batching" description="Group multiple events into a single webhook request to reduce load.">
                                    <label className="inline-flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                            checked={webhookSettings.webhookBatchingEnabled}
                                            onChange={(e) => handleSettingsChange('webhookBatchingEnabled', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-300 text-sm">Enable Global Webhook Batching</span>
                                    </label>
                                    {webhookSettings.webhookBatchingEnabled && (
                                        <div className="mt-2 grid grid-cols-2 gap-4">
                                            <FormField label="Batching Interval (ms)">
                                                <input
                                                    type="number"
                                                    value={webhookSettings.batchingIntervalMs || 1000}
                                                    onChange={(e) => handleSettingsChange('batchingIntervalMs', parseInt(e.target.value))}
                                                    min="100"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                            <FormField label="Max Events Per Batch">
                                                <input
                                                    type="number"
                                                    value={webhookSettings.batchingMaxEvents || 100}
                                                    onChange={(e) => handleSettingsChange('batchingMaxEvents', parseInt(e.target.value))}
                                                    min="1"
                                                    className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                                />
                                            </FormField>
                                        </div>
                                    )}
                                </FormField>
                            </Card>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={isSettingsLoading}
                                    className={`bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 ${isSettingsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSettingsLoading ? 'Saving...' : 'Save All Settings'}
                                </button>
                                {settingsSaveSuccess && !isSettingsLoading && (
                                    <span className="text-green-400 ml-3 flex items-center">
                                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Saved!
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- Audit Log Tab --- */}
                    {activeTab === 'audit-log' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Audit Log</h2>
                            <p className="text-gray-400">Track all significant actions performed on your webhook platform by users and automated systems.</p>

                            <Card className="p-4">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search by action, actor, resource ID..."
                                        className="flex-1 min-w-[200px] bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        onChange={(e) => handleAuditLogFilterChange('searchTerm', e.target.value)}
                                    />
                                    <select
                                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                        onChange={(e) => handleAuditLogFilterChange('resourceType', e.target.value)}
                                        value={auditLogFilters.resourceType || 'All'}
                                    >
                                        <option value="All">All Resource Types</option>
                                        <option value="webhook">Webhook</option>
                                        <option value="api_key">API Key</option>
                                        <option value="settings">Settings</option>
                                        <option value="event">Event</option>
                                        <option value="alert_rule">Alert Rule</option>
                                    </select>
                                    <select
                                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                        onChange={(e) => handleAuditLogFilterChange('actor', e.target.value)}
                                        value={auditLogFilters.actor || 'All'}
                                    >
                                        <option value="All">All Actors</option>
                                        <option value="user_admin">user_admin</option>
                                        <option value="user_dev">user_dev</option>
                                        <option value="system">system</option>
                                    </select>
                                </div>
                            </Card>

                            <Card title="Recent Audit Events">
                                {displayedAuditLogs.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No audit logs found matching your criteria.</p>
                                ) : (
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                            <tr>
                                                <th className="px-6 py-3">Timestamp</th>
                                                <th className="px-6 py-3">Actor</th>
                                                <th className="px-6 py-3">Action</th>
                                                <th className="px-6 py-3">Resource Type</th>
                                                <th className="px-6 py-3">Resource ID</th>
                                                <th className="px-6 py-3">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedAuditLogs.map(log => (
                                                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800">
                                                    <td className="px-6 py-4 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-mono text-white text-xs">{log.actor}</td>
                                                    <td className="px-6 py-4 text-white text-xs">{log.action}</td>
                                                    <td className="px-6 py-4 text-white text-xs">{log.resourceType}</td>
                                                    <td className="px-6 py-4 font-mono text-white text-xs">{log.resourceId}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs max-w-sm truncate" title={JSON.stringify(log.details)}>{JSON.stringify(log.details)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                <Pagination pagination={auditLogPagination} onPageChange={setCurrentAuditLogPage} />
                            </Card>
                        </div>
                    )}

                    {/* --- Developer Tools Tab --- */}
                    {activeTab === 'testing' && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Developer Tools</h2>
                            <p className="text-gray-400">Tools for testing, replaying, and debugging webhook events.</p>

                            <Card title="Webhook Event Tester">
                                <p className="text-gray-400 mb-4">Simulate sending a webhook event to a specific endpoint or to all matching subscribers.</p>
                                <div className="space-y-4">
                                    <FormField label="Target Webhook (Optional)" description="Leave blank to send to all webhooks subscribed to the event type.">
                                        <select
                                            value={testEventConfig.webhookId || ''}
                                            onChange={(e) => handleTestEventConfigChange('webhookId', e.target.value || undefined)}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="">All matching webhooks</option>
                                            {webhooks.map(wh => <option key={wh.id} value={wh.id}>{wh.url} ({wh.id})</option>)}
                                        </select>
                                    </FormField>

                                    <FormField label="Event Type" htmlFor="testEventType" error={testEventErrors.eventType}>
                                        <input
                                            id="testEventType"
                                            type="text"
                                            value={testEventConfig.eventType}
                                            onChange={(e) => handleTestEventConfigChange('eventType', e.target.value)}
                                            placeholder="e.g., test.event, user.activated"
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            required
                                        />
                                    </FormField>

                                    <FormField label="Payload (JSON)" htmlFor="testPayload" error={testEventErrors.payload}>
                                        <textarea
                                            id="testPayload"
                                            value={JSON.stringify(testEventConfig.payload, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    handleTestEventConfigChange('payload', JSON.parse(e.target.value));
                                                } catch {
                                                    // Invalid JSON, will be caught by validation on submit
                                                }
                                            }}
                                            rows={8}
                                            className="font-mono bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 text-sm resize-y"
                                        ></textarea>
                                    </FormField>

                                    <DynamicKeyValueList
                                        label="Custom Headers"
                                        items={testHeaders}
                                        onItemChange={handleTestHeadersChange}
                                        onAddItem={handleAddTestHeader}
                                        onRemoveItem={handleRemoveTestHeader}
                                        keyPlaceholder="Header-Key"
                                        valuePlaceholder="Header Value"
                                        addButtonText="Add Header"
                                        description="Headers to be sent with the test event."
                                    />

                                    <DynamicKeyValueList
                                        label="Metadata"
                                        items={testMetadata}
                                        onItemChange={handleTestMetadataChange}
                                        onAddItem={handleAddTestMetadata}
                                        onRemoveItem={handleRemoveTestMetadata}
                                        keyPlaceholder="metadata-key"
                                        valuePlaceholder="metadata-value"
                                        addButtonText="Add Metadata"
                                        description="Custom metadata for the test event."
                                    />

                                    <button
                                        onClick={handleSendTestEvent}
                                        disabled={isTestLoading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {isTestLoading ? 'Sending Test...' : 'Send Test Event'}
                                    </button>

                                    {testResult && (
                                        <Card title="Test Result">
                                            <pre className="text-xs bg-gray-900 p-3 rounded-md overflow-x-auto text-white">{JSON.stringify(testResult, null, 2)}</pre>
                                        </Card>
                                    )}
                                </div>
                            </Card>

                            <Card title="Event Replay Tool">
                                <p className="text-gray-400 mb-4">Replay past failed (or delivered) events to one or more webhooks. Useful for recovering missed data or re-processing events after a fix.</p>
                                <div className="space-y-4">
                                    <FormField label="Target Webhooks" description="Select specific webhooks or leave empty for all events matching other criteria.">
                                        <select
                                            multiple
                                            value={eventReplayConfig.webhookIds}
                                            onChange={(e) => handleEventReplayConfigChange('webhookIds', Array.from(e.target.selectedOptions, option => option.value))}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm h-32"
                                        >
                                            {webhooks.map(wh => <option key={wh.id} value={wh.id}>{wh.url} ({wh.id})</option>)}
                                        </select>
                                    </FormField>

                                    <FormField label="Event Types" description="Select specific event types or '*' for all.">
                                        <select
                                            multiple
                                            value={eventReplayConfig.eventTypes}
                                            onChange={(e) => handleEventReplayConfigChange('eventTypes', Array.from(e.target.selectedOptions, option => option.value))}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm h-32"
                                        >
                                            <option value="*">* (All Event Types)</option>
                                            {Array.from(new Set(events.map(e => e.type))).map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </FormField>

                                    <FormField label="Filter by Status">
                                        <select
                                            value={eventReplayConfig.statusFilter || 'All'}
                                            onChange={(e) => handleEventReplayConfigChange('statusFilter', e.target.value === 'All' ? undefined : e.target.value as 'Failed' | 'Delivered')}
                                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Failed">Only Failed Events</option>
                                            <option value="Delivered">Only Delivered Events</option>
                                        </select>
                                    </FormField>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Date Range (Start)">
                                            <input
                                                type="date"
                                                value={eventReplayConfig.dateRange.start}
                                                onChange={(e) => handleEventReplayConfigChange('dateRange', { ...eventReplayConfig.dateRange, start: e.target.value })}
                                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            />
                                        </FormField>
                                        <FormField label="Date Range (End)">
                                            <input
                                                type="date"
                                                value={eventReplayConfig.dateRange.end}
                                                onChange={(e) => handleEventReplayConfigChange('dateRange', { ...eventReplayConfig.dateRange, end: e.target.value })}
                                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Max Events to Replay">
                                            <input
                                                type="number"
                                                value={eventReplayConfig.maxEvents}
                                                onChange={(e) => handleEventReplayConfigChange('maxEvents', parseInt(e.target.value))}
                                                min="1"
                                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            />
                                        </FormField>
                                        <FormField label="Batch Size (per API call)">
                                            <input
                                                type="number"
                                                value={eventReplayConfig.batchSize}
                                                onChange={(e) => handleEventReplayConfigChange('batchSize', parseInt(e.target.value))}
                                                min="1"
                                                className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-cyan-500 focus:border-cyan-500 text-sm"
                                            />
                                        </FormField>
                                    </div>

                                    <FormField label="Dry Run" description="Perform a simulation without actually replaying events.">
                                        <label className="inline-flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                                checked={eventReplayConfig.dryRun}
                                                onChange={(e) => handleEventReplayConfigChange('dryRun', e.target.checked)}
                                            />
                                            <span className="ml-2 text-gray-300 text-sm">Enable Dry Run</span>
                                        </label>
                                    </FormField>

                                    <button
                                        onClick={handleInitiateEventReplay}
                                        disabled={isReplayLoading}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 disabled:opacity-50"
                                    >
                                        {isReplayLoading ? 'Processing...' : eventReplayConfig.dryRun ? 'Start Dry Run' : 'Initiate Replay'}
                                    </button>

                                    {replayResults && (
                                        <Card title="Replay Results">
                                            <pre className="text-xs bg-gray-900 p-3 rounded-md overflow-x-auto text-white">{JSON.stringify(replayResults, null, 2)}</pre>
                                        </Card>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WebhookSimulator;