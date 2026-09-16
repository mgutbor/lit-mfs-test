import { css } from 'lit';

export const dashboardTheme = css`
  :host {
    display: block;
    font-family: var(--font-family, system-ui, -apple-system, sans-serif);
    color: var(--color-text-primary);
    background: var(--color-background);
    padding: var(--spacing-md, 16px);
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard section{
    margin-top: 2rem;
  }

  .dashboard h1 {
    font-size: var(--font-size-xl, 1.5rem);
    margin: 0 0 var(--spacing-md, 16px) 0;
    color: var(--color-primary);
  }

  .dashboard h2 {
    font-size: var(--font-size-lg, 1.25rem);
    margin: 0 0 var(--spacing-sm, 8px) 0;
    color: var(--color-text-primary);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md, 16px);
    margin-bottom: var(--spacing-lg, 24px);
  }

  .stat-card {
    background: var(--color-surface);
    border-radius: var(--border-radius, 4px);
    padding: var(--spacing-md, 16px);
  }

  .stat-card h3 {
    margin: 0 0 var(--spacing-xs, 4px) 0;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-secondary);
  }

  .stat-card p {
    margin: 0;
    font-size: var(--font-size-xl, 1.5rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
  }

  .orders-table {
    width: 100%;
    border-collapse: collapse;
  }

  .orders-table th,
  .orders-table td {
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    text-align: left;
    border-bottom: 1px solid var(--color-surface);
    color: var(--color-text-primary);
  }

  .orders-table th {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-secondary);
  }

  .status {
    display: inline-block;
    padding: 2px 8px;
    border-radius: var(--border-radius, 4px);
    font-size: var(--font-size-xs, 0.75rem);
    text-transform: capitalize;
  }

  .status-pending {
    background: var(--color-status-pending-background);
    color: var(--color-status-pending-text);
  }

  .status-processing {
    background: var(--color-status-processing-background);
    color: var(--color-status-processing-text);
  }

  .status-shipped {
    background: var(--color-status-shipped-background);
    color: var(--color-status-shipped-text);
  }

  .status-delivered {
    background: var(--color-status-delivered-background);
    color: var(--color-status-delivered-text);
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-md, 16px);
  }

  .post-card {
    background: var(--color-surface);
    border-radius: var(--border-radius, 4px);
    padding: var(--spacing-md, 16px);
  }

  .post-card h3 {
    margin: 0 0 var(--spacing-sm, 8px) 0;
    font-size: var(--font-size-md, 1rem);
    color: var(--color-text-primary);
  }

  .post-card p,
  .muted {
    margin: 0;
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-secondary);
  }
`;
