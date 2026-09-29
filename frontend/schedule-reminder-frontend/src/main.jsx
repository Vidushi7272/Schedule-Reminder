import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = 'http://localhost:8081';

async function api(path, opt = {}) {
    const r = await fetch(API + path, {
        headers: {
            'Content-Type': 'application/json',
            ...(opt.headers || {})
        },
        ...opt
    });

    const t = await r.text();

    let d = null;

    try {
        d = t ? JSON.parse(t) : null;
    } catch {
        d = t;
    }

    if (!r.ok) {
        throw new Error(
            d?.message ||
            d?.error ||
            (typeof d === 'string'
                ? d
                : `Request failed (${r.status})`)
        );
    }

    return d;
}

const fmt = v =>
    v
        ? new Date(v).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
        : '—';

const sid = r =>
    r?.subject?.id ?? r?.subjectId;

function allowed(v) {
    if (!v) {
        return ['ONCE', 'HOURLY', 'DAILY', 'WEEKLY'];
    }

    const d = new Date(v) - Date.now();
    const h = 3600000;

    if (d <= h) {
        return ['ONCE'];
    }

    if (d <= 24 * h) {
        return ['ONCE', 'HOURLY'];
    }

    if (d <= 7 * 24 * h) {
        return ['ONCE', 'HOURLY', 'DAILY'];
    }

    return ['ONCE', 'HOURLY', 'DAILY', 'WEEKLY'];
}


/* =========================
   APP
========================= */

function App() {

    const weekDays = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY'
    ];

    const [tab, setTab] = useState('dashboard');

    const [subjects, setSubjects] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [entries, setEntries] = useState([]);
    const [notification, setNotification] = useState(null);
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(true);

    // Start on today's day.
    const [timetableDay, setTimetableDay] = useState(
        weekDays[new Date().getDay()]
    );


    const load = async () => {

        setLoading(true);
        setErr('');

        try {

            const [s, r, t] = await Promise.all([
                api('/Subject'),
                api('/Reminder'),
                api('/Entry')
            ]);

            setSubjects(
                Array.isArray(s) ? s : []
            );

            setReminders(
                Array.isArray(r) ? r : []
            );

            setEntries(
                Array.isArray(t) ? t : []
            );

        } catch (e) {

            setErr(e.message);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        if (!reminders.length) return;

        const checkReminders = () => {
            const now = new Date();

            reminders.forEach(reminder => {
                if (
                    !reminder.completed &&
                    reminder.nextReminderTime &&
                    new Date(reminder.nextReminderTime) <= now
                ) {
                    notifyReminder(reminder, (data) => {
                        setNotification(data);
                    });
                }
            });
        };

        checkReminders();

        const interval = setInterval(checkReminders, 30000);

        return () => clearInterval(interval);
    }, [reminders]);

    useEffect(() => {
        load();
    }, []);


    return (

        <div className="app">

            <aside>

                <div className="brand">

                    <b>✓</b>

                    <span>
                        Schedule
                        <br />
                        <small>Reminder</small>
                    </span>

                </div>


                {[
                    ['dashboard', '⌂', 'Dashboard'],
                    ['timetable', '▦', 'Timetable'],
                    ['subjects', '◈', 'Subjects'],
                    ['reminders', '◷', 'Reminders']
                ].map(x => (

                    <button
                        className={
                            tab === x[0]
                                ? 'nav active'
                                : 'nav'
                        }
                        onClick={() =>
                            setTab(x[0])
                        }
                        key={x[0]}
                    >

                        <i>{x[1]}</i>

                        {x[2]}

                    </button>

                ))}


                <div className="sidefoot">

                    <button onClick={load}>
                        ↻ Refresh
                    </button>

                    <small>
                        API: localhost:8081
                    </small>

                </div>

            </aside>
            {notification && (
                <div className="app-notification">
                    <div>
                        <strong>🔔 Reminder due</strong>
                        <div>{notification.title}</div>
                        <small>{notification.description}</small>
                    </div>

                    <button onClick={() => setNotification(null)}>
                        ×
                    </button>
                </div>
            )}

            <main className="main">

                <header>

                    <div>

                        <small>
                            PERSONAL PLANNER
                        </small>

                        <h1>
                            {
                                tab === 'dashboard'
                                    ? 'Good evening'
                                    : tab[0].toUpperCase() +
                                    tab.slice(1)
                            }
                        </h1>

                    </div>


                    <button onClick={load}>
                        Refresh
                    </button>

                </header>


                {err && (

                    <div className="error">

                        <b>
                            Backend error
                        </b>

                        <span>
                            {err}
                        </span>

                    </div>

                )}


                {loading ? (

                    <div className="empty">
                        Loading…
                    </div>

                ) : tab === 'dashboard' ? (

                    <Dashboard
                        setTab={setTab}
                        subjects={subjects}
                        reminders={reminders}
                        entries={entries}
                    />

                ) : tab === 'subjects' ? (

                    <Subjects
                        subjects={subjects}
                        reload={load}
                    />

                ) : tab === 'reminders' ? (

                    <Reminders
                        reminders={reminders}
                        subjects={subjects}
                        reload={load}
                    />

                ) : (

                    <Timetable
                        entries={entries}
                        subjects={subjects}
                        reminders={reminders}
                        reload={load}
                        day={timetableDay}
                        setDay={setTimetableDay}
                    />

                )}

            </main>

        </div>
    );
}

function notifyReminder(reminder, showInApp) {
    const notified = JSON.parse(
        localStorage.getItem("notifiedReminders") || "{}"
    );

    const key = `${reminder.id}-${reminder.nextReminderTime}`;

    // Already notified this exact occurrence
    if (notified[key]) {
        return;
    }

    // IMPORTANT: mark it BEFORE showing anything
    notified[key] = true;

    localStorage.setItem(
        "notifiedReminders",
        JSON.stringify(notified)
    );

    // In-app notification
    showInApp({
        title: reminder.title,
        description:
            reminder.description || "Your reminder is due now."
    });

    // Browser notification
    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {
        new Notification(`Reminder: ${reminder.title}`, {
            body: reminder.description || "Your reminder is due now."
        });
    }
}
/* =========================
   DASHBOARD
========================= */

function Dashboard({
                       setTab,
                       subjects,
                       reminders,
                       entries
                   }) {

    const pending =
        reminders.filter(r => !r.completed);

    const done =
        reminders.filter(r => r.completed);

    const up =
        [...pending]
            .sort(
                (a, b) =>
                    new Date(a.deadline) -
                    new Date(b.deadline)
            )
            .slice(0, 5);


    return (

        <div>

            <section className="hero">

                <div>

                    <small>
                        TODAY
                    </small>

                    <h2>
                        Keep your schedule visible.
                    </h2>

                    <p>
                        Subjects, timetable and reminders
                        in one place.
                    </p>

                </div>


                <button
                    className="primary"
                    onClick={() =>
                        setTab('reminders')
                    }
                >
                    + Add reminder
                </button>

            </section>


            <div className="stats">

                {[
                    ['Subjects', subjects.length],
                    ['Pending', pending.length],
                    ['Completed', done.length],
                    ['Timetable', entries.length]
                ].map(x => (

                    <div key={x[0]}>

                        <small>
                            {x[0]}
                        </small>

                        <b>
                            {x[1]}
                        </b>

                    </div>

                ))}

            </div>


            <section>

                <div className="sect">

                    <h3>
                        Upcoming reminders
                    </h3>

                    <button
                        onClick={() =>
                            setTab('reminders')
                        }
                    >
                        View all →
                    </button>

                </div>


                {up.length ? (

                    <div className="list">

                        {up.map(r => (

                            <div
                                className="row"
                                key={r.id}
                            >

                                <span className="pill">
                                    {r.repeatType || 'ONCE'}
                                </span>

                                <div>

                                    <b>
                                        {r.title}
                                    </b>

                                    <small>
                                        {
                                            subjects.find(
                                                s =>
                                                    String(s.id) ===
                                                    String(sid(r))
                                            )?.title ||
                                            r.subject?.title ||
                                            'No subject'
                                        }
                                    </small>

                                </div>

                                <time>
                                    {fmt(r.deadline)}
                                </time>

                            </div>

                        ))}

                    </div>

                ) : (

                    <div className="empty">
                        No pending reminders.
                    </div>

                )}

            </section>

        </div>
    );
}


/* =========================
   SUBJECTS
========================= */

function Subjects({
                      subjects,
                      reload
                  }) {

    const [f, setF] = useState({
        title: '',
        color: '#7161e8'
    });

    const [msg, setMsg] =
        useState('');


    const add = async e => {

        e.preventDefault();

        try {

            await api('/Subject', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            setF({
                title: '',
                color: '#7161e8'
            });

            setMsg('Added.');

            await reload();

        } catch (e) {

            setMsg(e.message);

        }
    };


    const del = async id => {

        if (!confirm('Delete this subject?')) {
            return;
        }

        try {

            await api(
                '/Subject/' + id,
                {
                    method: 'DELETE'
                }
            );

            await reload();

        } catch (e) {

            setMsg(e.message);

        }
    };


    return (

        <div className="grid2">

            <section className="panel">

                <h3>
                    Add subject
                </h3>

                <form onSubmit={add}>

                    <label>

                        Name

                        <input
                            required
                            maxLength="20"
                            value={f.title}
                            onChange={e =>
                                setF({
                                    ...f,
                                    title:
                                    e.target.value
                                })
                            }
                        />

                    </label>


                    <label>

                        Color

                        <input
                            type="color"
                            value={f.color}
                            onChange={e =>
                                setF({
                                    ...f,
                                    color:
                                    e.target.value
                                })
                            }
                        />

                    </label>


                    <button className="primary">
                        Add subject
                    </button>

                </form>


                {msg && (
                    <small>
                        {msg}
                    </small>
                )}

            </section>


            <section className="panel">

                <h3>
                    Subjects
                </h3>

                <div className="cards">

                    {subjects.map(s => (

                        <div
                            className="subject"
                            style={{
                                borderLeftColor:
                                    s.color ||
                                    '#7161e8'
                            }}
                            key={s.id}
                        >

                            <b>
                                {s.title}
                            </b>

                            <button
                                onClick={() =>
                                    del(s.id)
                                }
                            >
                                Delete
                            </button>

                        </div>

                    ))}

                </div>

            </section>

        </div>
    );
}


/* =========================
   REMINDERS
========================= */

function Reminders({
                       reminders,
                       subjects,
                       reload
                   }) {

    const fresh = () => ({
        title: '',
        description: '',
        deadline:
            new Date(
                Date.now() + 2 * 3600000
            )
                .toISOString()
                .slice(0, 16),
        repeatType: 'ONCE',
        subjectId:
            subjects[0]?.id || ''
    });


    const [f, setF] =
        useState(fresh);

    const [edit, setEdit] =
        useState(null);

    const [msg, setMsg] =
        useState('');


    const opts = useMemo(
        () => allowed(f.deadline),
        [f.deadline]
    );


    useEffect(() => {

        if (!opts.includes(f.repeatType)) {

            setF(x => ({
                ...x,
                repeatType: opts[0]
            }));

        }

    }, [opts.join(',')]);


    const save = async e => {

        e.preventDefault();

        try {

            const body = {

                title: f.title,

                description:
                f.description,

                deadline:
                f.deadline,

                repeatType:
                f.repeatType,

                completed:
                    false,

                subject: {
                    id:
                        Number(f.subjectId)
                }

            };


            await api(
                edit
                    ? '/Reminder/' + edit
                    : '/Reminder',
                {
                    method:
                        edit
                            ? 'PUT'
                            : 'POST',
                    body:
                        JSON.stringify(body)
                }
            );


            setMsg(
                edit
                    ? 'Updated.'
                    : 'Created.'
            );

            setEdit(null);

            setF(fresh());

            await reload();

        } catch (e) {

            setMsg(e.message);

        }
    };


    const start = r => {

        setEdit(r.id);

        setF({

            title:
                r.title || '',

            description:
                r.description || '',

            deadline:
                r.deadline?.slice(0, 16) || '',

            repeatType:
                r.repeatType || 'ONCE',

            subjectId:
                sid(r) ||
                subjects[0]?.id ||
                ''

        });

    };


    const del = async id => {

        if (!confirm('Delete this reminder?')) {
            return;
        }

        try {

            await api(
                '/Reminder/' + id,
                {
                    method: 'DELETE'
                }
            );

            await reload();

        } catch (e) {

            setMsg(e.message);

        }
    };


    return (

        <div className="grid2">

            <section className="panel">

                <h3>
                    {
                        edit
                            ? 'Edit reminder'
                            : 'Create reminder'
                    }
                </h3>


                <form onSubmit={save}>

                    <label>

                        Title

                        <input
                            required
                            value={f.title}
                            onChange={e =>
                                setF({
                                    ...f,
                                    title:
                                    e.target.value
                                })
                            }
                        />

                    </label>


                    <label>

                        Description

                        <textarea
                            value={f.description}
                            onChange={e =>
                                setF({
                                    ...f,
                                    description:
                                    e.target.value
                                })
                            }
                        />

                    </label>


                    <label>

                        Subject

                        <select
                            required
                            value={f.subjectId}
                            onChange={e =>
                                setF({
                                    ...f,
                                    subjectId:
                                    e.target.value
                                })
                            }
                        >

                            <option value="">
                                Select subject
                            </option>

                            {subjects.map(s => (

                                <option
                                    key={s.id}
                                    value={s.id}
                                >
                                    {s.title}
                                </option>

                            ))}

                        </select>

                    </label>


                    <label>

                        Deadline

                        <input
                            required
                            type="datetime-local"
                            value={f.deadline}
                            onChange={e =>
                                setF({
                                    ...f,
                                    deadline:
                                    e.target.value
                                })
                            }
                        />

                    </label>


                    <div>

                        <label>
                            Repeat
                        </label>

                        <div className="repeats">

                            {opts.map(o => (

                                <button
                                    type="button"
                                    className={
                                        f.repeatType === o
                                            ? 'repeat active'
                                            : 'repeat'
                                    }
                                    onClick={() =>
                                        setF({
                                            ...f,
                                            repeatType: o
                                        })
                                    }
                                    key={o}
                                >
                                    {o}
                                </button>

                            ))}

                        </div>

                        <small>
                            Frontend suggestion;
                            backend remains the
                            final validator.
                        </small>

                    </div>


                    <button
                        className="primary"
                        disabled={!f.subjectId}
                    >
                        {
                            edit
                                ? 'Save changes'
                                : 'Create reminder'
                        }
                    </button>


                    {edit && (

                        <button
                            type="button"
                            onClick={() => {

                                setEdit(null);
                                setF(fresh());

                            }}
                        >
                            Cancel
                        </button>

                    )}


                    {msg && (
                        <small>
                            {msg}
                        </small>
                    )}

                </form>

            </section>


            <section className="panel">

                <div className="sect">

                    <h3>
                        All reminders
                    </h3>

                    <span>
                        {reminders.length}
                    </span>

                </div>


                <div className="list">

                    {reminders.map(r => (

                        <div
                            className={
                                r.completed
                                    ? 'row done'
                                    : 'row'
                            }
                            key={r.id}
                        >

                            <span className="check">
                                {
                                    r.completed
                                        ? '✓'
                                        : '○'
                                }
                            </span>


                            <div>

                                <b>
                                    {r.title}
                                </b>

                                <small>
                                    {
                                        subjects.find(
                                            s =>
                                                String(s.id) ===
                                                String(sid(r))
                                        )?.title ||
                                        r.subject?.title ||
                                        'No subject'
                                    }

                                    {' · '}

                                    {fmt(r.deadline)}
                                </small>

                                <small>
                                    {r.repeatType || 'ONCE'}
                                    {' · next '}
                                    {fmt(r.nextReminderTime)}
                                </small>

                            </div>


                            <div className="actions">

                                {!r.completed && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            start(r)
                                        }
                                    >
                                        Edit
                                    </button>

                                )}

                                <button
                                    type="button"
                                    onClick={() =>
                                        del(r.id)
                                    }
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </section>

        </div>
    );
}


/* =========================
   TIMETABLE
========================= */

function Timetable({
                       entries,
                       subjects,
                       reminders,
                       reload,
                       day,
                       setDay
                   }) {

    const days = [
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY'
    ];

    const [showForm, setShowForm] = useState(false);
    const [edit, setEdit] = useState(null);
    const [msg, setMsg] = useState('');

    const fresh = () => ({
        subjectId: subjects[0]?.id || '',
        day: day,
        startTime: '',
        endTime: ''
    });

    const [form, setForm] = useState(fresh);

    const rows = entries
        .filter(
            e =>
                String(e.day).toUpperCase() === day
        )
        .sort(
            (a, b) =>
                String(a.startTime).localeCompare(
                    String(b.startTime)
                )
        );


    const openAdd = () => {

        setEdit(null);

        setForm({
            subjectId: subjects[0]?.id || '',
            day: day,
            startTime: '',
            endTime: ''
        });

        setMsg('');
        setShowForm(true);
    };


    const openEdit = (entry) => {

        setEdit(entry.id);

        setForm({
            subjectId:
                entry.subject?.id || '',

            day:
            entry.day,

            startTime:
                entry.startTime?.slice(0, 5) || '',

            endTime:
                entry.endTime?.slice(0, 5) || ''
        });

        setMsg('');
        setShowForm(true);
    };


    const save = async (e) => {

        e.preventDefault();

        if (!form.subjectId) {
            setMsg('Please select a subject.');
            return;
        }

        if (!form.startTime || !form.endTime) {
            setMsg(
                'Please enter both start and end time.'
            );
            return;
        }

        if (form.startTime >= form.endTime) {
            setMsg(
                'End time must be after start time.'
            );
            return;
        }

        try {

            const body = {

                day:
                form.day,

                startTime:
                    form.startTime + ':00',

                endTime:
                    form.endTime + ':00',

                subject: {
                    id:
                        Number(form.subjectId)
                }
            };


            await api(
                edit
                    ? `/Entry/${edit}`
                    : '/Entry',
                {
                    method:
                        edit
                            ? 'PUT'
                            : 'POST',

                    body:
                        JSON.stringify(body)
                }
            );


            setMsg(
                edit
                    ? 'Routine updated.'
                    : 'Routine added.'
            );

            setShowForm(false);
            setEdit(null);

            await reload();

        } catch (e) {

            setMsg(e.message);

        }
    };


    const deleteOne = async (id) => {

        if (!window.confirm(
            'Delete this routine?'
        )) {
            return;
        }

        try {

            await api(
                `/Entry/${id}`,
                {
                    method: 'DELETE'
                }
            );

            await reload();

            setMsg(
                'Routine deleted.'
            );

        } catch (e) {

            setMsg(e.message);

        }
    };


    const deleteAll = async () => {

        if (!entries.length) {

            setMsg(
                'There are no routines to delete.'
            );

            return;
        }

        if (!window.confirm(
            'Delete ALL timetable routines?'
        )) {
            return;
        }

        try {

            await api(
                '/Entry/all',
                {
                    method: 'DELETE'
                }
            );

            await reload();

            setMsg(
                'All routines deleted.'
            );

        } catch (e) {

            setMsg(e.message);

        }
    };


    return (

        <div>

            <div className="sect">

                <h3>
                    Timetable
                </h3>

                <button
                    type="button"
                    onClick={deleteAll}
                    disabled={!entries.length}
                >
                    Delete All
                </button>

            </div>


            <div className="days">

                {days.map(d => (

                    <button
                        type="button"
                        className={
                            d === day
                                ? 'active'
                                : ''
                        }
                        onClick={() => {

                            setDay(d);

                            if (!showForm) {

                                setForm(f => ({
                                    ...f,
                                    day: d
                                }));

                            }

                        }}
                        key={d}
                    >
                        {d.slice(0, 3)}
                    </button>

                ))}

            </div>


            <div className="sect">

                <h3>
                    {day}
                </h3>

                <button
                    type="button"
                    onClick={openAdd}
                >
                    + Add Routine
                </button>

            </div>


            {showForm && (

                <section
                    className="panel"
                    style={{
                        marginBottom: '18px'
                    }}
                >

                    <h3>
                        {
                            edit
                                ? 'Edit Routine'
                                : 'Add Routine'
                        }
                    </h3>


                    <form onSubmit={save}>

                        <label>

                            Subject

                            <select
                                required
                                value={
                                    form.subjectId
                                }
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        subjectId:
                                        e.target.value
                                    })
                                }
                            >

                                <option value="">
                                    Select subject
                                </option>

                                {subjects.map(s => (

                                    <option
                                        key={s.id}
                                        value={s.id}
                                    >
                                        {s.title}
                                    </option>

                                ))}

                            </select>

                        </label>


                        <label>

                            Day

                            <select
                                value={form.day}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        day:
                                        e.target.value
                                    })
                                }
                            >

                                {days.map(d => (

                                    <option
                                        key={d}
                                        value={d}
                                    >
                                        {d}
                                    </option>

                                ))}

                            </select>

                        </label>


                        <label>

                            Start time

                            <input
                                type="time"
                                required
                                value={
                                    form.startTime
                                }
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        startTime:
                                        e.target.value
                                    })
                                }
                            />

                        </label>


                        <label>

                            End time

                            <input
                                type="time"
                                required
                                value={
                                    form.endTime
                                }
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        endTime:
                                        e.target.value
                                    })
                                }
                            />

                        </label>


                        <button
                            type="submit"
                            className="primary"
                        >
                            {
                                edit
                                    ? 'Save Changes'
                                    : 'Add Routine'
                            }
                        </button>


                        <button
                            type="button"
                            onClick={() => {

                                setShowForm(false);
                                setEdit(null);

                            }}
                        >
                            Cancel
                        </button>


                        {msg && (
                            <small>
                                {msg}
                            </small>
                        )}

                    </form>

                </section>

            )}


            {rows.length ? (

                <div className="timeline">

                    {rows.map(e => {

                        const subject =
                            subjects.find(
                                s =>
                                    String(s.id) ===
                                    String(
                                        e.subject?.id
                                    )
                            );


                        const subjectReminders =
                            reminders
                                .filter(r => {

                                    const reminderSubjectId =
                                        r.subject?.id ??
                                        r.subjectId;

                                    return (
                                        String(
                                            reminderSubjectId
                                        ) ===
                                        String(
                                            subject?.id
                                        )
                                    );

                                })
                                .filter(
                                    r =>
                                        !r.completed
                                )
                                .sort(
                                    (a, b) =>
                                        new Date(
                                            a.deadline
                                        ) -
                                        new Date(
                                            b.deadline
                                        )
                                );


                        return (

                            <div
                                className="time"
                                key={e.id}
                            >

                                <time>

                                    {e.startTime?.slice(
                                        0,
                                        5
                                    )}

                                    <small>

                                        {e.endTime?.slice(
                                            0,
                                            5
                                        )}

                                    </small>

                                </time>


                                <div
                                    className="routine-info"
                                    style={{
                                        borderLeftColor:
                                            subject?.color ||
                                            '#7161e8'
                                    }}
                                >

                                    <b>
                                        {
                                            subject?.title ||
                                            e.subject?.title ||
                                            'Unknown Subject'
                                        }
                                    </b>


                                    {subjectReminders.length > 0 && (

                                        <div className="subject-reminders">

                                            <strong>
                                                Upcoming reminders
                                            </strong>


                                            {subjectReminders.map(
                                                r => (

                                                    <div
                                                        className="subject-reminder"
                                                        key={r.id}
                                                    >

                                                        <span>
                                                            {r.title}
                                                        </span>

                                                        <small>
                                                            {fmt(
                                                                r.deadline
                                                            )}
                                                        </small>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}


                                    <div className="actions">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEdit(e)
                                            }
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteOne(
                                                    e.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            ) : (

                <div className="empty">

                    No routines found for{' '}
                    {day.toLowerCase()}.

                </div>

            )}

        </div>
    );
}


createRoot(
    document.getElementById('root')
).render(
    <App />
);