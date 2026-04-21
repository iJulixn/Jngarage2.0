import React, { useEffect, useMemo, useState } from 'react';
import {
  Car,
  Users,
  CalendarDays,
  Wallet,
  Search,
  CheckCircle2,
  Clock3,
  Droplets,
  Wrench,
  Banknote,
  CreditCard,
  LogOut,
  Lock,
  User,
  ShieldCheck,
  Globe,
  NotebookTabs,
  Plus,
} from 'lucide-react';

const STORAGE_KEY = 'jngarage-app-v1';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const seedData = {
  business: {
    nombre: 'JN Garage Detail',
    telefono: '1157933932',
    zona: 'Berazategui',
    instagram: '@JNGarageDetail',
  },
  users: [
    { id: 1, username: 'julian', password: '1234', nombre: 'Julian', rol: 'admin' },
    { id: 2, username: 'empleado', password: '1234', nombre: 'Empleado', rol: 'staff' },
  ],
  clients: [
    { id: 1, nombre: 'Lucas Fernández', telefono: '11 4587-2211', patente: 'AB123CD', vehiculo: 'Toyota Corolla 2010', notas: 'Cliente habitual' },
    { id: 2, nombre: 'Mariano López', telefono: '11 5974-8811', patente: 'AE456FG', vehiculo: 'Volkswagen Gol', notas: 'Le gusta turno temprano' },
  ],
  services: [
    { id: 1, nombre: 'Lavado básico', precio: 12000, duracion: 45, activo: true, publico: true },
    { id: 2, nombre: 'Lavado premium', precio: 18000, duracion: 75, activo: true, publico: true },
    { id: 3, nombre: 'Pulido de ópticas', precio: 25000, duracion: 90, activo: true, publico: true },
    { id: 4, nombre: 'Pulido de pintura', precio: 55000, duracion: 240, activo: true, publico: false },
  ],
  turns: [
    {
      id: 1,
      clienteId: 1,
      servicioId: 1,
      fecha: todayISO(),
      hora: '09:00',
      estado: 'pendiente',
      cobrado: false,
      medioPago: '',
      canal: 'manual',
      notas: '',
    },
    {
      id: 2,
      clienteId: 2,
      servicioId: 3,
      fecha: todayISO(),
      hora: '11:00',
      estado: 'en_proceso',
      cobrado: true,
      medioPago: 'transferencia',
      canal: 'manual',
      notas: 'Trajo ópticas muy opacas',
    },
  ],
};

function money(v) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(v || 0);
}

function statusLabel(estado) {
  const map = {
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    terminado: 'Terminado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  return map[estado] || estado;
}

function nextStatus(estado) {
  const flow = ['pendiente', 'en_proceso', 'terminado', 'entregado'];
  const idx = flow.indexOf(estado);
  return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : estado;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedData;
    return JSON.parse(raw);
  } catch {
    return seedData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [appData, setAppData] = useState(seedData);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [login, setLogin] = useState({ username: 'julian', password: '1234' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setAppData(loadData());
  }, []);

  useEffect(() => {
    saveData(appData);
  }, [appData]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = appData.users.find(
      (u) => u.username === login.username && u.password === login.password
    );
    if (!user) {
      setLoginError('Usuario o contraseña incorrectos');
      return;
    }
    setSession(user);
    setLoginError('');
  };

  if (!session) {
    return <LoginScreen business={appData.business} login={login} setLogin={setLogin} loginError={loginError} handleLogin={handleLogin} />;
  }

  return <DashboardApp appData={appData} setAppData={setAppData} session={session} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setSession(null)} />;
}

function LoginScreen({ business, login, setLogin, loginError, handleLogin }) {
  return (
    <div className="page center-page">
      <div className="login-grid">
        <div className="card big-card">
          <div className="brand-row">
            <div className="icon-box dark"><Droplets size={28} /></div>
            <div>
              <h1>{business.nombre}</h1>
              <p className="muted">Panel del lavadero</p>
            </div>
          </div>
          <form className="stack" onSubmit={handleLogin}>
            <label className="field-label">Usuario</label>
            <div className="input-wrap">
              <User size={16} className="input-icon" />
              <input value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} />
            </div>
            <label className="field-label">Contraseña</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            </div>
            {loginError ? <div className="alert error">{loginError}</div> : null}
            <button className="btn primary" type="submit">Entrar</button>
            <div className="hint">Demo: usuario <b>julian</b> y clave <b>1234</b></div>
          </form>
        </div>

        <div className="stack">
          <div className="card big-card">
            <h2>Lo que más te conviene</h2>
            <p className="muted">
              Para vos conviene arrancar con una app web simple: clientes, turnos, caja,
              login y un formulario online para tomar reservas.
            </p>
            <div className="feature-list">
              <Feature icon={ShieldCheck} text="Login para vos y empleados" />
              <Feature icon={Globe} text="Turnos online para clientes" />
              <Feature icon={NotebookTabs} text="Clientes, servicios y caja" />
              <Feature icon={Wallet} text="Datos guardados en el navegador" />
            </div>
          </div>
          <div className="card">
            <div><b>Zona:</b> {business.zona}</div>
            <div><b>WhatsApp:</b> {business.telefono}</div>
            <div><b>Instagram:</b> {business.instagram}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="feature-item">
      <div className="icon-box"><Icon size={16} /></div>
      <div>{text}</div>
    </div>
  );
}

function DashboardApp({ appData, setAppData, session, activeTab, setActiveTab, onLogout }) {
  const { business, clients, services, turns } = appData;
  const [clientSearch, setClientSearch] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showTurnForm, setShowTurnForm] = useState(false);

  const [newClient, setNewClient] = useState({ nombre: '', telefono: '', patente: '', vehiculo: '', notas: '' });
  const [newService, setNewService] = useState({ nombre: '', precio: '', duracion: '', publico: 'si' });
  const [newTurn, setNewTurn] = useState({ clienteId: '', servicioId: '', fecha: todayISO(), hora: '10:00', notas: '' });
  const [booking, setBooking] = useState({ nombre: '', telefono: '', patente: '', vehiculo: '', servicioId: '', fecha: todayISO(), hora: '14:00', notas: '' });

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
  const inProgress = todayTurns.filter((t) => t.estado === 'en_proceso').length;
  const finished = todayTurns.filter((t) => t.estado === 'terminado' || t.estado === 'entregado').length;
  const dayTotal = todayTurns.filter((t) => t.cobrado).reduce((acc, t) => acc + (t.servicio?.precio || 0), 0);
  const totalCharged = turnsDetailed.filter((t) => t.cobrado).reduce((acc, t) => acc + (t.servicio?.precio || 0), 0);

  const filteredClients = clients.filter((c) =>
    [c.nombre, c.telefono, c.patente, c.vehiculo].join(' ').toLowerCase().includes(clientSearch.toLowerCase())
  );

  const publicServices = services.filter((s) => s.publico && s.activo);

  function updateData(patch) {
    setAppData((prev) => ({ ...prev, ...patch }));
  }

  function addClient(e) {
    e.preventDefault();
    if (!newClient.nombre || !newClient.telefono) return;
    updateData({ clients: [...clients, { id: Date.now(), ...newClient }] });
    setNewClient({ nombre: '', telefono: '', patente: '', vehiculo: '', notas: '' });
    setShowClientForm(false);
    setActiveTab('clientes');
  }

  function addService(e) {
    e.preventDefault();
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
          publico: newService.publico === 'si',
        },
      ],
    });
    setNewService({ nombre: '', precio: '', duracion: '', publico: 'si' });
    setShowServiceForm(false);
    setActiveTab('servicios');
  }

  function addInternalTurn(e) {
    e.preventDefault();
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
          estado: 'pendiente',
          cobrado: false,
          medioPago: '',
          canal: 'manual',
          notas: newTurn.notas,
        },
      ],
    });
    setNewTurn({ clienteId: '', servicioId: '', fecha: todayISO(), hora: '10:00', notas: '' });
    setShowTurnForm(false);
    setActiveTab('turnos');
  }

  function addPublicBooking(e) {
    e.preventDefault();
    if (!booking.nombre || !booking.telefono || !booking.servicioId || !booking.fecha || !booking.hora) return;
    const newClientId = Date.now();
    const newTurnId = Date.now() + 1;
    updateData({
      clients: [
        ...clients,
        {
          id: newClientId,
          nombre: booking.nombre,
          telefono: booking.telefono,
          patente: booking.patente,
          vehiculo: booking.vehiculo,
          notas: 'Cliente creado desde turnos online',
        },
      ],
      turns: [
        ...turns,
        {
          id: newTurnId,
          clienteId: newClientId,
          servicioId: Number(booking.servicioId),
          fecha: booking.fecha,
          hora: booking.hora,
          estado: 'pendiente',
          cobrado: false,
          medioPago: '',
          canal: 'online',
          notas: booking.notas,
        },
      ],
    });
    setBooking({ nombre: '', telefono: '', patente: '', vehiculo: '', servicioId: '', fecha: todayISO(), hora: '14:00', notas: '' });
  }

  function advanceTurn(id) {
    updateData({
      turns: turns.map((t) => (t.id === id ? { ...t, estado: nextStatus(t.estado) } : t)),
    });
  }

  function chargeTurn(id, medioPago) {
    updateData({
      turns: turns.map((t) => (t.id === id ? { ...t, cobrado: true, medioPago } : t)),
    });
  }

  return (
    <div className="page">
      <div className="container">
        <header className="topbar card">
          <div>
            <h1>{business.nombre}</h1>
            <p className="muted">{business.zona} · WhatsApp {business.telefono} · {business.instagram}</p>
          </div>
          <div className="topbar-actions">
            <span className="pill">{session.nombre} · {session.rol}</span>
            <button className="btn secondary" onClick={onLogout}><LogOut size={16} /> Salir</button>
          </div>
        </header>

        <section className="summary-grid">
          <SummaryCard icon={CalendarDays} title="Turnos de hoy" value={todayTurns.length} />
          <SummaryCard icon={Droplets} title="En proceso" value={inProgress} />
          <SummaryCard icon={CheckCircle2} title="Terminados" value={finished} />
          <SummaryCard icon={Wallet} title="Caja del día" value={money(dayTotal)} />
        </section>

        <nav className="tabs">
          {['dashboard', 'clientes', 'turnos', 'servicios', 'caja', 'online'].map((tab) => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'clientes' && 'Clientes'}
              {tab === 'turnos' && 'Turnos'}
              {tab === 'servicios' && 'Servicios'}
              {tab === 'caja' && 'Caja'}
              {tab === 'online' && 'Turnos online'}
            </button>
          ))}
        </nav>

        {activeTab === 'dashboard' && (
          <section className="card section-card">
            <div className="section-header">
              <h2>Agenda del día</h2>
            </div>
            <div className="stack">
              {todayTurns.length === 0 ? <Empty text="No tenés turnos para hoy" /> : null}
              {todayTurns.map((t) => (
                <div key={t.id} className="row-card">
                  <div>
                    <div className="strong">{t.hora} · {t.cliente?.nombre}</div>
                    <div className="muted small">{t.cliente?.vehiculo} · {t.cliente?.patente || 'Sin patente'}</div>
                    <div className="muted small">{t.servicio?.nombre} · {money(t.servicio?.precio)} · canal {t.canal}</div>
                  </div>
                  <div className="actions-wrap">
                    <span className={`status ${t.estado}`}>{statusLabel(t.estado)}</span>
                    <button className="btn secondary" onClick={() => advanceTurn(t.id)}>Avanzar estado</button>
                    {!t.cobrado ? (
                      <>
                        <button className="btn secondary" onClick={() => chargeTurn(t.id, 'efectivo')}><Banknote size={16} /> Efectivo</button>
                        <button className="btn primary" onClick={() => chargeTurn(t.id, 'transferencia')}><CreditCard size={16} /> Transferencia</button>
                      </>
                    ) : (
                      <span className="pill">Cobrado · {t.medioPago}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'clientes' && (
          <section className="card section-card">
            <div className="section-header">
              <h2>Clientes</h2>
              <button className="btn primary" onClick={() => setShowClientForm((v) => !v)}><Plus size={16} /> Nuevo cliente</button>
            </div>
            {showClientForm && (
              <form className="form-grid card inner-card" onSubmit={addClient}>
                <input placeholder="Nombre" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} />
                <input placeholder="Teléfono" value={newClient.telefono} onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })} />
                <input placeholder="Patente" value={newClient.patente} onChange={(e) => setNewClient({ ...newClient, patente: e.target.value })} />
                <input placeholder="Vehículo" value={newClient.vehiculo} onChange={(e) => setNewClient({ ...newClient, vehiculo: e.target.value })} />
                <textarea placeholder="Notas" value={newClient.notas} onChange={(e) => setNewClient({ ...newClient, notas: e.target.value })} />
                <button className="btn primary" type="submit">Guardar cliente</button>
              </form>
            )}
            <div className="search-bar">
              <Search size={16} />
              <input placeholder="Buscar por nombre, patente o vehículo" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
            </div>
            <div className="grid-cards">
              {filteredClients.map((c) => (
                <div key={c.id} className="card small-card">
                  <div className="card-title-row">
                    <div>
                      <div className="strong">{c.nombre}</div>
                      <div className="muted small">{c.vehiculo}</div>
                    </div>
                    <Users size={18} />
                  </div>
                  <div className="small">Tel: {c.telefono}</div>
                  <div className="small">Patente: {c.patente || '—'}</div>
                  <div className="muted small">{c.notas || 'Sin notas'}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'turnos' && (
          <section className="card section-card">
            <div className="section-header">
              <h2>Turnos</h2>
              <button className="btn primary" onClick={() => setShowTurnForm((v) => !v)}><Plus size={16} /> Nuevo turno</button>
            </div>
            {showTurnForm && (
              <form className="form-grid card inner-card" onSubmit={addInternalTurn}>
                <select value={newTurn.clienteId} onChange={(e) => setNewTurn({ ...newTurn, clienteId: e.target.value })}>
                  <option value="">Seleccioná cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} · {c.patente || 'sin patente'}</option>
                  ))}
                </select>
                <select value={newTurn.servicioId} onChange={(e) => setNewTurn({ ...newTurn, servicioId: e.target.value })}>
                  <option value="">Seleccioná servicio</option>
                  {services.filter((s) => s.activo).map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre} · {money(s.precio)}</option>
                  ))}
                </select>
                <input type="date" value={newTurn.fecha} onChange={(e) => setNewTurn({ ...newTurn, fecha: e.target.value })} />
                <input type="time" value={newTurn.hora} onChange={(e) => setNewTurn({ ...newTurn, hora: e.target.value })} />
                <textarea placeholder="Notas" value={newTurn.notas} onChange={(e) => setNewTurn({ ...newTurn, notas: e.target.value })} />
                <button className="btn primary" type="submit">Guardar turno</button>
              </form>
            )}
            <div className="stack">
              {turnsDetailed.map((t) => (
                <div key={t.id} className="row-card">
                  <div>
                    <div className="strong">{t.fecha} · {t.hora} · {t.cliente?.nombre}</div>
                    <div className="muted small">{t.cliente?.vehiculo} · {t.cliente?.patente || 'Sin patente'}</div>
                    <div className="muted small">{t.servicio?.nombre} · {t.canal}</div>
                  </div>
                  <div className="actions-wrap">
                    <span className={`status ${t.estado}`}>{statusLabel(t.estado)}</span>
                    <button className="btn secondary" onClick={() => advanceTurn(t.id)}><Clock3 size={16} /> Estado</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'servicios' && (
          <section className="card section-card">
            <div className="section-header">
              <h2>Servicios</h2>
              <button className="btn primary" onClick={() => setShowServiceForm((v) => !v)}><Plus size={16} /> Agregar</button>
            </div>
            {showServiceForm && (
              <form className="form-grid card inner-card" onSubmit={addService}>
                <input placeholder="Nombre del servicio" value={newService.nombre} onChange={(e) => setNewService({ ...newService, nombre: e.target.value })} />
                <input type="number" placeholder="Precio" value={newService.precio} onChange={(e) => setNewService({ ...newService, precio: e.target.value })} />
                <input type="number" placeholder="Duración en minutos" value={newService.duracion} onChange={(e) => setNewService({ ...newService, duracion: e.target.value })} />
                <select value={newService.publico} onChange={(e) => setNewService({ ...newService, publico: e.target.value })}>
                  <option value="si">Mostrar en turnos online</option>
                  <option value="no">Solo interno</option>
                </select>
                <button className="btn primary" type="submit">Guardar servicio</button>
              </form>
            )}
            <div className="grid-cards">
              {services.map((s) => (
                <div key={s.id} className="card small-card">
                  <div className="card-title-row">
                    <div>
                      <div className="strong">{s.nombre}</div>
                      <div className="muted small">{s.duracion} min</div>
                    </div>
                    <Wrench size={18} />
                  </div>
                  <div className="price">{money(s.precio)}</div>
                  <div className="badge-row">
                    <span className="pill solid">{s.activo ? 'Activo' : 'Inactivo'}</span>
                    <span className="pill">{s.publico ? 'Online' : 'Interno'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'caja' && (
          <section className="stack">
            <div className="summary-grid">
              <SummaryCard icon={Banknote} title="Cobrado hoy" value={money(dayTotal)} />
              <SummaryCard icon={CreditCard} title="Cobrado total" value={money(totalCharged)} />
              <SummaryCard icon={Wallet} title="Pendientes de cobro" value={todayTurns.filter((t) => !t.cobrado).length} />
            </div>
            <div className="card section-card">
              <div className="section-header"><h2>Detalle de cobros</h2></div>
              <div className="stack">
                {todayTurns.map((t) => (
                  <div key={t.id} className="row-card">
                    <div>
                      <div className="strong">{t.cliente?.nombre}</div>
                      <div className="muted small">{t.servicio?.nombre}</div>
                    </div>
                    <div className="actions-wrap">
                      <div className="strong">{money(t.servicio?.precio)}</div>
                      {t.cobrado ? <span className="pill">{t.medioPago}</span> : <span className="pill solid">Sin cobrar</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'online' && (
          <section className="two-col-grid">
            <div className="card section-card">
              <div className="section-header"><h2>Formulario de turnos online</h2></div>
              <form className="form-grid" onSubmit={addPublicBooking}>
                <input placeholder="Nombre" value={booking.nombre} onChange={(e) => setBooking({ ...booking, nombre: e.target.value })} />
                <input placeholder="Teléfono" value={booking.telefono} onChange={(e) => setBooking({ ...booking, telefono: e.target.value })} />
                <input placeholder="Patente" value={booking.patente} onChange={(e) => setBooking({ ...booking, patente: e.target.value })} />
                <input placeholder="Vehículo" value={booking.vehiculo} onChange={(e) => setBooking({ ...booking, vehiculo: e.target.value })} />
                <select value={booking.servicioId} onChange={(e) => setBooking({ ...booking, servicioId: e.target.value })}>
                  <option value="">Elegí servicio</option>
                  {publicServices.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre} · {money(s.precio)}</option>
                  ))}
                </select>
                <input type="date" value={booking.fecha} onChange={(e) => setBooking({ ...booking, fecha: e.target.value })} />
                <input type="time" value={booking.hora} onChange={(e) => setBooking({ ...booking, hora: e.target.value })} />
                <textarea placeholder="Notas del cliente" value={booking.notas} onChange={(e) => setBooking({ ...booking, notas: e.target.value })} />
                <button className="btn primary" type="submit"><Globe size={16} /> Reservar turno</button>
              </form>
            </div>

            <div className="stack">
              <div className="card section-card">
                <div className="section-header"><h2>Qué sigue después</h2></div>
                <div className="stack small muted">
                  <div className="note-box"><b>Lo ideal:</b> React adelante, Flask atrás y PostgreSQL en Render.</div>
                  <div className="note-box">Esta versión ya sirve para mostrar y probar el flujo, pero guarda en localStorage.</div>
                  <div className="note-box">Después conviene sumar WhatsApp, reportes y usuarios con permisos reales.</div>
                </div>
              </div>
              <div className="card section-card">
                <div className="section-header"><h2>Resumen del negocio</h2></div>
                <div className="stack small">
                  <div><b>Nombre:</b> {business.nombre}</div>
                  <div><b>Zona:</b> {business.zona}</div>
                  <div><b>Instagram:</b> {business.instagram}</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, title, value }) {
  return (
    <div className="card summary-card">
      <div>
        <div className="muted small">{title}</div>
        <div className="summary-value">{value}</div>
      </div>
      <div className="icon-box"><Icon size={20} /></div>
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}
