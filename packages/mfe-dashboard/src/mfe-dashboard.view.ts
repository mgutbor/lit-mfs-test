import { html } from 'lit';
import type { MfeDashboard } from './mfe-dashboard.viewmodel';
import type { Todo, Post } from './model/mfe-dashboard.model';
import './components/orders-skeleton';
import './components/error-message';

export function renderDashboard(this: MfeDashboard) {
  return html`
    <div class="dashboard">
      <h1>Dashboard</h1>

      <section class="todos-section">
        <h2>Todos</h2>
        ${this.todosTask.render({
          initial: () => html`<p class="muted">Cargando datos...</p>`,
          pending: () => html`<orders-skeleton></orders-skeleton>`,
          complete: (todos: Todo[]) => html`
            <div class="stats">
              <div class="stat-card">
                <h3>Total</h3>
                <p>${todos.length}</p>
              </div>
              <div class="stat-card">
                <h3>Completed</h3>
                <p>${todos.filter((t: Todo) => t.completed).length}</p>
              </div>
              <div class="stat-card">
                <h3>Pending</h3>
                <p>${todos.filter((t: Todo) => !t.completed).length}</p>
              </div>
            </div>
            <table class="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${todos.slice(0, 10).map((todo: Todo) => html`
                  <tr>
                    <td>#${todo.id}</td>
                    <td>${todo.title}</td>
                    <td>
                      <span class="status ${todo.completed ? 'status-delivered' : 'status-pending'}">
                        ${todo.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          `,
          error: (e: unknown) => html`
            <error-message
              .error=${e instanceof Error ? e : new Error(String(e))}
              @retry=${() => this.todosTask.run()}
            ></error-message>
          `,
        })}
      </section>

      <section class="posts-section">
        <h2>Posts</h2>
        ${this.postsTask.render({
          initial: () => html`<p class="muted">Cargando datos...</p>`,
          pending: () => html`<orders-skeleton></orders-skeleton>`,
          complete: (posts: Post[]) => html`
            <div class="posts-grid">
              ${posts.slice(0, 6).map((post: Post) => html`
                <div class="post-card">
                  <h3>${post.title}</h3>
                  <p>${post.body.substring(0, 100)}...</p>
                </div>
              `)}
            </div>
          `,
          error: (e: unknown) => html`
            <error-message
              .error=${e instanceof Error ? e : new Error(String(e))}
              @retry=${() => this.postsTask.run()}
            ></error-message>
          `,
        })}
      </section>
    </div>
  `;
}
