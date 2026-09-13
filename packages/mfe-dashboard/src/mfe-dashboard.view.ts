import { html } from 'lit';
import type { MfeDashboard } from './mfe-dashboard.viewmodel';

export function renderDashboard(this: MfeDashboard) {
  return html`
    <div class="dashboard">
      <h1>Dashboard</h1>
      <div class="stats">
        <div class="stat-card">
          <h3>Total Orders</h3>
          <p>128</p>
        </div>
        <div class="stat-card">
          <h3>Revenue</h3>
          <p>$12,345</p>
        </div>
        <div class="stat-card">
          <h3>Pending</h3>
          <p>7</p>
        </div>
      </div>
      <table class="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#001</td>
            <td>John Doe</td>
            <td>Widget A</td>
            <td>$99.00</td>
            <td><span class="status status-delivered">Delivered</span></td>
          </tr>
          <tr>
            <td>#002</td>
            <td>Jane Smith</td>
            <td>Widget B</td>
            <td>$149.00</td>
            <td><span class="status status-processing">Processing</span></td>
          </tr>
          <tr>
            <td>#003</td>
            <td>Bob Johnson</td>
            <td>Widget C</td>
            <td>$199.00</td>
            <td><span class="status status-pending">Pending</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}
