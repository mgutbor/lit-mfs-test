import { css } from 'lit';

export const dashboardTheme = css`
  :host {
    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
    background: var(--color-background, #ffffff);
    padding: var(--spacing-md, 16px);
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard h1 {
    font-size: 1.5rem;
    margin: 0 0 var(--spacing-md, 16px) 0;
    color: var(--color-primary, #1976d2);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md, 16px);
    margin-bottom: var(--spacing-lg, 24px);
  }

  .stat-card {
    background: var(--color-surface, #f5f5f5);
    border-radius: var(--border-radius, 4px);
    padding: var(--spacing-md, 16px);
  }

  .stat-card h3 {
    margin: 0 0 var(--spacing-xs, 4px) 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .stat-card p {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
  }

  .orders-table th,
  .orders-table td {
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    text-align: left;
    border-bottom: 1px solid var(--color-surface, #f5f5f5);
  }

  .orders-table th {
    font-weight: 600;
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
  }

  .status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--border-radius, 4px);
    font-size: 0.75rem;
    text-transform: capitalize;
  }

  .status-pending {
    background: #fff3e0;
    color: #e65100;
  }

  .status-processing {
    background: #e3f2fd;
    color: #1565c0;
  }

  .status-shipped {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .status-delivered {
    background: #f3e5f5;
    color: #7b1fa2;
  }
`;
