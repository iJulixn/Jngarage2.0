import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "jngarage-pro-v1";

const seedData = {
  business: {
    nombre: "JN Garage Detail",
    telefono: "1157933932",
    zona: "Berazategui",
    instagram: "@JNGarageDetail",
  },
  users: [
    { id: 1, username: "julian", password: "1234", nombre: "Julian", rol: "admin" },
    { id: 2, username: "novia", password: "1234", nombre: "Novia", rol: "staff" },
  ],
  clients: [
    { id: 1, nombre: "Lucas Fernández", telefono: "11 4587-2211", patente: "AB123CD", vehiculo: "Toyota Corolla 2010", notas: "Cliente habitual" },
    { id: 2, nombre: "Mariano López", telefono: "11 5974-8811", patente: "AE456FG", vehiculo: "Volkswagen Gol", notas: "Le gusta turno temprano" },
  ],
  services: [
    { id: 1, nombre: "Lavado básico", precio: 12000, duracion: 45, activo: true, publico: true },
    { id: 2, nombre: "Lavado premium", precio: 18000, duracion: 75, activo: true, publico: true },
    { id: 3, nombre: "Pulido de ópticas", precio: 25000, duracion: 90, activo: true, publico: true },
    { id: 4, nombre: "Pulido de pintura", precio: 55000, duracion: 240, activo: true, publico: false },
  ],
  turns: [
    {
      id: 1,
      clienteId: 1,
      servicioId: 1,
      fecha: todayISO(),
      hora: "09:00",
      estado: "pendiente",
      cobrado: false,
      medioPago: "",
      canal: "manual",
      notas: "",
    },
    {
      id: 2,
      clienteId: 2,
      servicioId: 3,
      fecha: todayISO(),
      hora: "11:00",
      estado: "en_proceso",
      cobrado: true,
      medioPago: "transferencia",
      canal: "manual",
      notas: "Trajo ópticas muy opacas",
    },
  ],
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function money(v) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedData;
  } catch {
    return seedData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function nextStatus(estado) {
  const flow = ["pendiente", "en_proceso", "terminado", "entregado"];
  const idx = flow.indexOf(estado);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : estado;
}

function statusClass(estado) {
  if (estado === "pendiente") return "badge gray";
  if (estado === "en_proceso") return "badge blue";
  if (estado === "terminado") return "badge green";
  if (estado === "entregado") return "badge cyan";
  return "badge red";
}

function statusLabel(estado) {
  const map = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    terminado: "Terminado",
    entregado: "Entregado",
    cancelado: "Cancelado",
  };
  return map[estado] || estado;
}

function App() {
  const [appData, setAppData] = useState(seedData);
  const [session, setSession] = useState(null);
  const [login, setLogin] = useState({ username: "julian", password: "1234" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    setAppData(loadData());
  }, []);

  useEffect(() => {
    saveData(appData);
  }, [appData]);

  const handleLogin = (e) => {
    e?.preventDefault?.();
    const user = appData.users.find(
      (u) => u.username === login.username && u.password === login.password
    );
    if (!user) {
      setLoginError("Usuario o contraseña incorrectos");
      return;
    }
    setSession(user);
    setLoginError("");
  };

  if (!session) {
    return (
      <LoginScreen
        business={appData.business}
        login={login}
        setLogin={setLogin}
        handleLogin={handleLogin}
        loginError={loginError}
      />
    );
  }

  return (
    <Dashboard
      appData={appData}
      setAppData={setAppData}
      session={session}
      logout={() => setSession(null)}
    />
  );
}

function LoginScreen({ business, login, setLogin, handleLogin, loginError }) {
  return (
    <div className="page login-page">
      <div className="login-wrap">
        <div className="card login-card">
          <div className="brand-row">
            <div className="logo-mark">🚗</div>
            <div>
              <h1>{business.nombre}</h1>
              <p>Panel del lavadero</p>
            </div>
          </div>

          <div className="hero-box">
            <span className="eyebrow">Berazategui · Detailing</span>
            <h2>Lavadero, agenda y caja en un solo lugar</h2>
            <p>Entrá con tu usuario para manejar clientes, turnos, servicios y cobros.</p>
          </div>

          <form className="form-grid" onSubmit={handleLogin}>
            <label>
              Usuario
              <input
                value={login.username}
                onChange={(e) => setLogin({ ...login, username: e.target.value })}
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                value={login.password}
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
              />
            </label>

            {loginError ? <div className="alert error">{loginError}</div> : null}

            <button className="btn primary" type="submit">Entrar</button>
            <div className="demo-help">Demo: usuario <b>julian</b> y clave <b>1234</b></div>
          </form>
        </div>

        <div className="card side-card">
          <h3>Lo que más te conviene</h3>
          <ul className="feature-list">
            <li>Login para vos y tu compañera</li>
            <li>Agenda interna de turnos</li>
            <li>Clientes, servicios y caja</li>
            <li>Datos guardados en el navegador</li>
          </ul>
          <div className="contact-box">
            <div><b>Zona:</b> {business.zona}</div>
            <div><b>WhatsApp:</b> {business.telefono}</div>
            <div><b>Instagram:</b> {business.instagram}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ appData, setAppData, session, logout }) {
  const { business, clients, services, turns } = appData;
  const [tab, setTab] = useState("dashboard");

  const [clientSearch, setClientSearch] = useState("");
  const [turnSearch, setTurnSearch] = useState("");
  const [turnDateFilter, setTurnDateFilter] = useState(todayISO());
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState(todayISO().slice(0, 7));

  const [showNewClient, setShowNewClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [showNewTurn, setShowNewTurn] = useState(false);
  const [showEditTurn, setShowEditTurn] = useState(false);
  const [showNewService, setShowNewService] = useState(false);

  const [newClient, setNewClient] = useState({ nombre: "", telefono: "", patente: "", vehiculo: "", notas: "" });
  const [editingClient, setEditingClient] = useState(null);

  const [newTurn, setNewTurn] = useState({ clienteId: "", servicioId: "", fecha: todayISO(), hora: "10:00", notas: "" });
  const [editingTurn, setEditingTurn] = useState(null);

  const [newService, setNewService] = useState({ nombre: "", precio: "", duracion: "", publico: "si" });

  const turnsDetailed = useMemo(() => {
    return turns
      .map((t) => ({
        ...t,
        cliente: clients.find((c) => c.id === t.clienteId),
        servicio: services.find((s) => s.id === t.servicioId),
      }))
      .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  }, [turns, clients, services]);

  const todayTurns = turnsDetailed.filter((t) => t.fecha === todayISO());
  const filteredTurns = turnsDetailed.filter((t) => {
    const matchesDate = !turnDateFilter || t.fecha === turnDateFilter;
    const query = turnSearch.toLowerCase();
    const matchesSearch = [t.cliente?.nombre, t.cliente?.patente, t.cliente?.vehiculo, t.servicio?.nombre]
      .join(" ")
      .toLowerCase()
      .includes(query);
    return matchesDate && matchesSearch;
  });

  const filteredClients = clients.filter((c) =>
    [c.nombre, c.telefono, c.patente, c.vehiculo].join(" ").toLowerCase().includes(clientSearch.toLowerCase())
  );

  const inProgress = todayTurns.filter((t) => t.estado === "en_proceso").length;
  const finished = todayTurns.filter((t) => t.estado === "terminado" || t.estado === "entregado").length;
  const dayTotal = todayTurns.filter((t) => t.cobrado).reduce((acc, t) => acc + (t.servicio?.precio || 0), 0);
  const totalCobrado = turnsDetailed.filter((t) => t.cobrado).reduce((acc, t) => acc + (t.servicio?.precio || 0), 0);
  const selectedDayTotal = turnsDetailed
    .filter((t) => t.cobrado && (!turnDateFilter || t.fecha === turnDateFilter))
    .reduce((acc, t) => acc + (t.servicio?.precio || 0), 0);
  const selectedMonthTotal = turnsDetailed
    .filter((t) => t.cobrado && t.fecha.startsWith(selectedSummaryMonth))
    .reduce((acc, t) => acc + (t.servicio?.precio || 0), 0);
  const selectedMonthCount = turnsDetailed.filter((t) => t.fecha.startsWith(selectedSummaryMonth)).length;

  const updateData = (patch) => setAppData((prev) => ({ ...prev, ...patch }));

  const addClient = (e) => {
    e?.preventDefault?.();
    if (!newClient.nombre || !newClient.telefono) return;
    updateData({ clients: [...clients, { id: Date.now(), ...newClient }] });
    setNewClient({ nombre: "", telefono: "", patente: "", vehiculo: "", notas: "" });
    setShowNewClient(false);
  };

  const saveEditedClient = (e) => {
    e?.preventDefault?.();
    if (!editingClient || !editingClient.nombre || !editingClient.telefono) return;
    updateData({
      clients: clients.map((c) => (c.id === editingClient.id ? editingClient : c)),
    });
    setEditingClient(null);
    setShowEditClient(false);
  };

  const addService = (e) => {
    e?.preventDefault?.();
    if (!newService.nombre || !newService.precio || !newService.duracion) return;
    updateData({
      services: [
        ...services,
        {
          id: Date.now(),
          nombre: newService.nombre,
          precio: Number(newService.precio),
          duracion: Number(newService.duracion),
          activo: true,
          publico: newService.publico === "si",
        },
      ],
    });
    setNewService({ nombre: "", precio: "", duracion: "", publico: "si" });
    setShowNewService(false);
  };

  const addInternalTurn = (e) => {
    e?.preventDefault?.();
    if (!newTurn.clienteId || !newTurn.servicioId) return;
    updateData({
      turns: [
        ...turns,
        {
          id: Date.now(),
          clienteId: Number(newTurn.clienteId),
          servicioId: Number(newTurn.servicioId),
          fecha: newTurn.fecha,
          hora: newTurn.hora,
          estado: "pendiente",
          cobrado: false,
          medioPago: "",
          canal: "manual",
          notas: newTurn.notas,
        },
      ],
    });
    setNewTurn({ clienteId: "", servicioId: "", fecha: todayISO(), hora: "10:00", notas: "" });
    setShowNewTurn(false);
  };

  const saveEditedTurn = (e) => {
    e?.preventDefault?.();
    if (!editingTurn || !editingTurn.clienteId || !editingTurn.servicioId) return;
    updateData({
      turns: turns.map((t) =>
        t.id === editingTurn.id
          ? {
              ...t,
              clienteId: Number(editingTurn.clienteId),
              servicioId: Number(editingTurn.servicioId),
              fecha: editingTurn.fecha,
              hora: editingTurn.hora,
              estado: editingTurn.estado,
              notas: editingTurn.notas,
            }
          : t
      ),
    });
    setEditingTurn(null);
    setShowEditTurn(false);
  };

  const deleteTurn = (id) => {
    if (!window.confirm("¿Eliminar este turno?")) return;
    updateData({ turns: turns.filter((t) => t.id !== id) });
  };

  const advanceTurn = (id) => {
    updateData({
      turns: turns.map((t) => (t.id === id ? { ...t, estado: nextStatus(t.estado) } : t)),
    });
  };

  const chargeTurn = (id, medioPago) => {
    updateData({
      turns: turns.map((t) => (t.id === id ? { ...t, cobrado: true, medioPago } : t)),
    });
  };

  return (
    <div className="page">
      <div className="app-shell">
        <header className="topbar card">
          <div>
            <h1>{business.nombre}</h1>
            <p>{business.zona} · WhatsApp {business.telefono} · {business.instagram}</p>
          </div>
          <div className="top-actions">
            <span className="badge outline">{session.nombre} · {session.rol}</span>
            <a
              className="btn ghost"
              href={`https://wa.me/54${business.telefono}?text=Hola%20JN%20Garage,%20quiero%20consultar%20por%20un%20turno`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <button className="btn ghost" onClick={logout}>Salir</button>
          </div>
        </header>

        <section className="summary-grid">
          <SummaryCard title="Turnos de hoy" value={todayTurns.length} />
          <SummaryCard title="En proceso" value={inProgress} />
          <SummaryCard title="Terminados" value={finished} />
          <SummaryCard title="Caja del día" value={money(dayTotal)} />
        </section>

        <nav className="tabs">
          {["dashboard", "clientes", "turnos", "servicios", "caja"].map((name) => (
            <button
              key={name}
              className={`tab ${tab === name ? "active" : ""}`}
              onClick={() => setTab(name)}
            >
              {name === "dashboard" ? "Dashboard" : name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && (
          <section className="card section-card">
            <div className="section-head">
              <h2>Agenda del día</h2>
            </div>

            <div className="filters two">
              <input
                placeholder="Buscar por patente, cliente o servicio"
                value={turnSearch}
                onChange={(e) => setTurnSearch(e.target.value)}
              />
              <input
                type="date"
                value={turnDateFilter}
                onChange={(e) => setTurnDateFilter(e.target.value)}
              />
            </div>

            <div className="stack">
              {todayTurns.map((t) => (
                <div key={t.id} className="item-card">
                  <div>
                    <div className="item-title">{t.hora} · {t.cliente?.nombre}</div>
                    <div className="item-sub">{t.cliente?.vehiculo} · {t.cliente?.patente || "Sin patente"}</div>
                    <div className="item-sub">{t.servicio?.nombre} · {money(t.servicio?.precio)} · canal {t.canal}</div>
                  </div>
                  <div className="action-wrap">
                    <span className={statusClass(t.estado)}>{statusLabel(t.estado)}</span>
                    <button className="btn ghost" onClick={() => advanceTurn(t.id)}>Avanzar estado</button>
                    {!t.cobrado ? (
                      <>
                        <button className="btn ghost" onClick={() => chargeTurn(t.id, "efectivo")}>Efectivo</button>
                        <button className="btn primary" onClick={() => chargeTurn(t.id, "transferencia")}>Transferencia</button>
                      </>
                    ) : (
                      <span className="badge outline">Cobrado · {t.medioPago}</span>
                    )}
                  </div>
                </div>
              ))}
              {todayTurns.length === 0 && <Empty text="No tenés turnos cargados para hoy" />}
            </div>
          </section>
        )}

        {tab === "clientes" && (
          <section className="card section-card">
            <div className="section-head">
              <h2>Clientes</h2>
              <button className="btn primary" onClick={() => setShowNewClient(true)}>Nuevo cliente</button>
            </div>

            <div className="filters">
              <input
                placeholder="Buscar por nombre, patente o vehículo"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>

            <div className="grid-cards">
              {filteredClients.map((c) => (
                <div key={c.id} className="mini-card">
                  <div className="item-title">{c.nombre}</div>
                  <div className="item-sub">{c.vehiculo}</div>
                  <div className="text-line">Tel: {c.telefono}</div>
                  <div className="text-line">Patente: {c.patente || "—"}</div>
                  <div className="item-sub">{c.notas || "Sin notas"}</div>
                  <button
                    className="btn ghost full"
                    onClick={() => {
                      setEditingClient({ ...c });
                      setShowEditClient(true);
                    }}
                  >
                    Editar cliente
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "turnos" && (
          <section className="card section-card">
            <div className="section-head">
              <h2>Turnos</h2>
              <button className="btn primary" onClick={() => setShowNewTurn(true)}>Nuevo turno</button>
            </div>

            <div className="stack">
              {filteredTurns.map((t) => (
                <div key={t.id} className="item-card">
                  <div>
                    <div className="item-title">{t.fecha} · {t.hora} · {t.cliente?.nombre}</div>
                    <div className="item-sub">{t.cliente?.vehiculo} · {t.cliente?.patente || "Sin patente"}</div>
                    <div className="item-sub">{t.servicio?.nombre} · {t.canal}</div>
                  </div>
                  <div className="action-wrap">
                    <span className={statusClass(t.estado)}>{statusLabel(t.estado)}</span>
                    <button className="btn ghost" onClick={() => advanceTurn(t.id)}>Estado</button>
                    <button
                      className="btn ghost"
                      onClick={() => {
                        setEditingTurn({ ...t, clienteId: String(t.clienteId), servicioId: String(t.servicioId) });
                        setShowEditTurn(true);
                      }}
                    >
                      Editar
                    </button>
                    <button className="btn danger" onClick={() => deleteTurn(t.id)}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "servicios" && (
          <section className="card section-card">
            <div className="section-head">
              <h2>Servicios</h2>
              <button className="btn primary" onClick={() => setShowNewService(true)}>Agregar</button>
            </div>

            <div className="grid-cards">
              {services.map((s) => (
                <div key={s.id} className="mini-card">
                  <div className="item-title">{s.nombre}</div>
                  <div className="item-sub">{s.duracion} min</div>
                  <div className="price">{money(s.precio)}</div>
                  <div className="badge-row">
                    <span className={`badge ${s.activo ? "green" : "gray"}`}>{s.activo ? "Activo" : "Inactivo"}</span>
                    <span className="badge outline">{s.publico ? "Online" : "Interno"}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "caja" && (
          <>
            <section className="card section-card">
              <div className="section-head">
                <h2>Resumen diario y mensual</h2>
              </div>
              <div className="summary-2">
                <div>
                  <label>Filtrar día</label>
                  <input type="date" value={turnDateFilter} onChange={(e) => setTurnDateFilter(e.target.value)} />
                  <div className="soft-box">Total del día filtrado: <b>{money(selectedDayTotal)}</b></div>
                </div>
                <div>
                  <label>Mes del resumen</label>
                  <input type="month" value={selectedSummaryMonth} onChange={(e) => setSelectedSummaryMonth(e.target.value)} />
                  <div className="soft-box">
                    Total mensual: <b>{money(selectedMonthTotal)}</b><br />
                    Turnos del mes: <b>{selectedMonthCount}</b>
                  </div>
                </div>
              </div>
            </section>

            <section className="summary-grid four">
              <SummaryCard title="Cobrado hoy" value={money(dayTotal)} />
              <SummaryCard title="Cobrado total" value={money(totalCobrado)} />
              <SummaryCard title="Pendientes de cobro" value={todayTurns.filter((t) => !t.cobrado).length} />
              <SummaryCard title="Total mensual" value={money(selectedMonthTotal)} />
            </section>

            <section className="card section-card">
              <div className="section-head">
                <h2>Detalle de cobros</h2>
              </div>
              <div className="stack">
                {todayTurns.map((t) => (
                  <div key={t.id} className="item-card">
                    <div>
                      <div className="item-title">{t.cliente?.nombre}</div>
                      <div className="item-sub">{t.servicio?.nombre}</div>
                    </div>
                    <div className="action-wrap">
                      <div className="price">{money(t.servicio?.precio)}</div>
                      {t.cobrado ? <span className="badge outline">{t.medioPago}</span> : <span className="badge gray">Sin cobrar</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {showNewClient && (
        <Modal title="Agregar cliente" onClose={() => setShowNewClient(false)}>
          <form className="form-grid" onSubmit={addClient}>
            <input placeholder="Nombre" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} />
            <input placeholder="Teléfono" value={newClient.telefono} onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })} />
            <input placeholder="Patente" value={newClient.patente} onChange={(e) => setNewClient({ ...newClient, patente: e.target.value })} />
            <input placeholder="Vehículo" value={newClient.vehiculo} onChange={(e) => setNewClient({ ...newClient, vehiculo: e.target.value })} />
            <textarea placeholder="Notas" value={newClient.notas} onChange={(e) => setNewClient({ ...newClient, notas: e.target.value })} />
            <button className="btn primary" type="submit">Guardar cliente</button>
          </form>
        </Modal>
      )}

      {showEditClient && editingClient && (
        <Modal title="Editar cliente" onClose={() => { setShowEditClient(false); setEditingClient(null); }}>
          <form className="form-grid" onSubmit={saveEditedClient}>
            <input placeholder="Nombre" value={editingClient.nombre} onChange={(e) => setEditingClient({ ...editingClient, nombre: e.target.value })} />
            <input placeholder="Teléfono" value={editingClient.telefono} onChange={(e) => setEditingClient({ ...editingClient, telefono: e.target.value })} />
            <input placeholder="Patente" value={editingClient.patente} onChange={(e) => setEditingClient({ ...editingClient, patente: e.target.value })} />
            <input placeholder="Vehículo" value={editingClient.vehiculo} onChange={(e) => setEditingClient({ ...editingClient, vehiculo: e.target.value })} />
            <textarea placeholder="Notas" value={editingClient.notas} onChange={(e) => setEditingClient({ ...editingClient, notas: e.target.value })} />
            <button className="btn primary" type="submit">Guardar cambios</button>
          </form>
        </Modal>
      )}

      {showNewTurn && (
        <Modal title="Agregar turno" onClose={() => setShowNewTurn(false)}>
          <form className="form-grid" onSubmit={addInternalTurn}>
            <select value={newTurn.clienteId} onChange={(e) => setNewTurn({ ...newTurn, clienteId: e.target.value })}>
              <option value="">Seleccioná cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.nombre} · {c.patente || "sin patente"}</option>)}
            </select>
            <select value={newTurn.servicioId} onChange={(e) => setNewTurn({ ...newTurn, servicioId: e.target.value })}>
              <option value="">Seleccioná servicio</option>
              {services.filter((s) => s.activo).map((s) => <option key={s.id} value={s.id}>{s.nombre} · {money(s.precio)}</option>)}
            </select>
            <input type="date" value={newTurn.fecha} onChange={(e) => setNewTurn({ ...newTurn, fecha: e.target.value })} />
            <input type="time" value={newTurn.hora} onChange={(e) => setNewTurn({ ...newTurn, hora: e.target.value })} />
            <textarea placeholder="Notas" value={newTurn.notas} onChange={(e) => setNewTurn({ ...newTurn, notas: e.target.value })} />
            <button className="btn primary" type="submit">Guardar turno</button>
          </form>
        </Modal>
      )}

      {showEditTurn && editingTurn && (
        <Modal title="Editar turno" onClose={() => { setShowEditTurn(false); setEditingTurn(null); }}>
          <form className="form-grid" onSubmit={saveEditedTurn}>
            <select value={editingTurn.clienteId} onChange={(e) => setEditingTurn({ ...editingTurn, clienteId: e.target.value })}>
              <option value="">Seleccioná cliente</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.nombre} · {c.patente || "sin patente"}</option>)}
            </select>
            <select value={editingTurn.servicioId} onChange={(e) => setEditingTurn({ ...editingTurn, servicioId: e.target.value })}>
              <option value="">Seleccioná servicio</option>
              {services.filter((s) => s.activo).map((s) => <option key={s.id} value={s.id}>{s.nombre} · {money(s.precio)}</option>)}
            </select>
            <input type="date" value={editingTurn.fecha} onChange={(e) => setEditingTurn({ ...editingTurn, fecha: e.target.value })} />
            <input type="time" value={editingTurn.hora} onChange={(e) => setEditingTurn({ ...editingTurn, hora: e.target.value })} />
            <select value={editingTurn.estado} onChange={(e) => setEditingTurn({ ...editingTurn, estado: e.target.value })}>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
              <option value="terminado">Terminado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <textarea placeholder="Notas" value={editingTurn.notas || ""} onChange={(e) => setEditingTurn({ ...editingTurn, notas: e.target.value })} />
            <button className="btn primary" type="submit">Guardar cambios</button>
          </form>
        </Modal>
      )}

      {showNewService && (
        <Modal title="Nuevo servicio" onClose={() => setShowNewService(false)}>
          <form className="form-grid" onSubmit={addService}>
            <input placeholder="Nombre del servicio" value={newService.nombre} onChange={(e) => setNewService({ ...newService, nombre: e.target.value })} />
            <input type="number" placeholder="Precio" value={newService.precio} onChange={(e) => setNewService({ ...newService, precio: e.target.value })} />
            <input type="number" placeholder="Duración en minutos" value={newService.duracion} onChange={(e) => setNewService({ ...newService, duracion: e.target.value })} />
            <select value={newService.publico} onChange={(e) => setNewService({ ...newService, publico: e.target.value })}>
              <option value="si">Mostrar online</option>
              <option value="no">Solo interno</option>
            </select>
            <button className="btn primary" type="submit">Guardar servicio</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="card summary-card">
      <div className="summary-title">{title}</div>
      <div className="summary-value">{value}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty-box">{text}</div>;
}

export default App;
