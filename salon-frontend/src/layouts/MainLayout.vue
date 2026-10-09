
<template>
  <div class="salon-layout">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">F</div>
        <div>
          <h2>Flora Studio</h2>
          <span>BEAUTY & CARE</span>
        </div>
      </div>

      <div class="menu-label">MENÚ PRINCIPAL</div>

      <nav class="navigation">
        <RouterLink to="/" class="nav-link" exact-active-class="active">
          <span class="nav-icon">⌂</span>
          <span>Inicio</span>
        </RouterLink>

        <RouterLink to="/citas" class="nav-link" active-class="active">
          <span class="nav-icon">▦</span>
          <span>Agenda de citas</span>
        </RouterLink>

        <RouterLink to="/clientes" class="nav-link" active-class="active">
          <span class="nav-icon">♡</span>
          <span>Clientes</span>
        </RouterLink>

        <RouterLink to="/estilistas" class="nav-link" active-class="active">
          <span class="nav-icon">✧</span>
          <span>Estilistas</span>
        </RouterLink>

        <RouterLink to="/servicios" class="nav-link" active-class="active">
          <span class="nav-icon">✿</span>
          <span>Servicios</span>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <div class="decorative-flower">✿</div>
        <p>Un momento para ti</p>
        <span>Tu belleza, nuestro cuidado.</span>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <div>
          <span class="topbar-caption">TU ESPACIO DE BELLEZA</span>
          <h1>Bienvenida a Flora Studio</h1>
        </div>

        <div class="topbar-decoration">
          <span>✿</span>
          <div>
            <strong>Atención especial</strong>
            <small>Cada detalle importa</small>
          </div>
        </div>
      </header>

      <section class="page-content">
        <RouterView />
      </section>

      <footer class="footer">
        Flora Studio · Belleza y bienestar
      </footer>
    </main>
  </div>
</template>

<style scoped>
.salon-layout {
  min-height: 100vh;
  display: flex;
  background: #fbf7f5;
  color: #49373b;
  font-family: Arial, Helvetica, sans-serif;
}

.sidebar {
  width: 245px;
  flex-shrink: 0;
  background: #fffdfb;
  border-right: 1px solid #f0e5e2;
  padding: 30px 18px;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 35px;
}

.brand-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #8b4b60;
  color: white;
  font-family: Georgia, serif;
  font-size: 27px;
}

.brand h2 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 21px;
  font-weight: normal;
}

.brand span {
  display: block;
  margin-top: 5px;
  color: #a47b85;
  font-size: 9px;
  letter-spacing: 2px;
}

.menu-label {
  padding: 0 12px;
  margin-bottom: 15px;
  color: #b29da1;
  font-size: 10px;
  letter-spacing: 1.5px;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 13px;
  border-radius: 10px;
  color: #78666b;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s, color 0.2s;
}

.nav-link:hover {
  background: #f9efef;
  color: #8b4b60;
}

.nav-link.active {
  background: #8b4b60;
  color: white;
  box-shadow: 0 5px 12px #8b4b6020;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 20px;
}

.sidebar-bottom {
  margin-top: auto;
  padding: 22px 14px;
  border-radius: 12px;
  background: #f8eeed;
}

.decorative-flower {
  color: #a9657b;
  font-size: 27px;
}

.sidebar-bottom p {
  margin: 12px 0 6px;
  font-family: Georgia, serif;
  font-size: 17px;
}

.sidebar-bottom span {
  color: #967d82;
  font-size: 11px;
}

.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  min-height: 105px;
  padding: 25px 36px;
  background: #fffdfb;
  border-bottom: 1px solid #f0e5e2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.topbar-caption {
  color: #a47b85;
  font-size: 10px;
  letter-spacing: 2px;
}

.topbar h1 {
  margin: 8px 0 0;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: normal;
}

.topbar-decoration {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #f0e3e1;
  border-radius: 12px;
  background: #fffaf8;
}

.topbar-decoration > span {
  color: #a9657b;
  font-size: 25px;
}

.topbar-decoration strong,
.topbar-decoration small {
  display: block;
}

.topbar-decoration strong {
  font-size: 12px;
}

.topbar-decoration small {
  margin-top: 5px;
  color: #a18a8e;
  font-size: 11px;
}

.page-content {
  flex: 1;
  padding: 30px 36px;
}

.footer {
  padding: 18px 36px;
  border-top: 1px solid #f0e5e2;
  color: #a18a8e;
  font-size: 11px;
}

@media (max-width: 760px) {
  .salon-layout {
    flex-direction: column;
  }

  .sidebar {
    width: auto;
    padding: 18px;
  }

  .brand {
    padding-bottom: 20px;
  }

  .menu-label,
  .sidebar-bottom {
    display: none;
  }

  .navigation {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .nav-link {
    flex-shrink: 0;
    padding: 11px;
    font-size: 12px;
  }

  .topbar {
    padding: 22px 18px;
  }

  .topbar h1 {
    font-size: 20px;
  }

  .topbar-decoration {
    display: none;
  }

  .page-content {
    padding: 22px 16px;
  }

  .footer {
    padding: 16px;
  }
}
</style>