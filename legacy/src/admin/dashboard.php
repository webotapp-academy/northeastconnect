<?php
require __DIR__ . '/auth.php';
admin_require_auth();

$page_title = 'Dashboard';
$active = 'dashboard';

function render_content() {
?>
  <section class="cards">
    <div class="card">
      <div class="label">Total Listings</div>
      <div class="value">1,248</div>
      <div class="delta up">+4.2% vs last week</div>
    </div>
    <div class="card">
      <div class="label">Culture Posts</div>
      <div class="value">312</div>
      <div class="delta up">+2.1% vs last week</div>
    </div>
    <div class="card">
      <div class="label">News Articles</div>
      <div class="value">98</div>
      <div class="delta down">-1.2% vs last week</div>
    </div>
    <div class="card">
      <div class="label">Pending Reviews</div>
      <div class="value">17</div>
      <div class="delta">0 this week</div>
    </div>
  </section>

  <section class="grid-2 mt-16">
    <div class="panel">
      <h3 style="margin:0 0 12px;">Recent Directory Listings</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Assam Tea House</td>
            <td>Food & Beverage</td>
            <td><span class="badge">Published</span></td>
            <td>2024-06-10</td>
          </tr>
          <tr>
            <td>Brahmaputra Tours</td>
            <td>Travel</td>
            <td><span class="badge">Draft</span></td>
            <td>2024-06-09</td>
          </tr>
          <tr>
            <td>Silk Weavers Co-op</td>
            <td>Shopping</td>
            <td><span class="badge">Published</span></td>
            <td>2024-06-08</td>
          </tr>
        </tbody>
      </table>
      <div class="actions mt-16">
        <a class="btn" href="/admin/directory.php">Manage Directory</a>
        <a class="btn outline" href="#">View all</a>
      </div>
    </div>

    <div class="panel">
      <h3 style="margin:0 0 12px;">Recent News Articles</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monsoon Festivals Across Assam</td>
            <td>Editor</td>
            <td><span class="badge">Published</span></td>
            <td>2024-06-09</td>
          </tr>
          <tr>
            <td>New Eco-Trails Announced</td>
            <td>Admin</td>
            <td><span class="badge">Draft</span></td>
            <td>—</td>
          </tr>
          <tr>
            <td>Local Crafts Spotlight</td>
            <td>Author</td>
            <td><span class="badge">Published</span></td>
            <td>2024-06-06</td>
          </tr>
        </tbody>
      </table>
      <div class="actions mt-16">
        <a class="btn" href="/admin/news.php">Manage News</a>
        <a class="btn outline" href="#">View all</a>
      </div>
    </div>
  </section>

  <section class="panel mt-16">
    <h3 style="margin:0 0 12px;">Quick Actions</h3>
    <div class="actions">
      <a class="btn" href="/admin/culture.php">New Culture Post</a>
      <a class="btn" href="/admin/directory.php">Add Listing</a>
      <a class="btn" href="/admin/news.php">Write News</a>
      <a class="btn outline" href="//" target="_blank">View Site</a>
    </div>
  </section>
<?php
}

include __DIR__ . '/partials/layout.php';
?>