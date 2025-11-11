import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Backend API base URL
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

const initialDevices = [
    { type: 'PS5', name: 'PS5 #1', img: 'https://img.icons8.com/?size=100&id=rseRGUUHZGNU&format=png&color=ffffff', rate: 18000 },
    { type: 'PS5', name: 'PS5 #2', img: 'https://img.icons8.com/?size=100&id=rseRGUUHZGNU&format=png&color=ffffff', rate: 18000 },
    { type: 'PS4', name: 'PS4 #1', img: 'https://img.icons8.com/?size=100&id=zBcnw2-gQOt2&format=png&color=ffffff', rate: 12000 },
    { type: 'PS4', name: 'PS4 #2', img: 'https://img.icons8.com/?size=100&id=zBcnw2-gQOt2&format=png&color=ffffff', rate: 12000 },
    { type: 'PC', name: 'PC #1', img: 'https://img.icons8.com/?size=100&id=buti0ig4reqf&format=png&color=ffffff', rate: 10000 },
    { type: 'PC', name: 'PC #2', img: 'https://img.icons8.com/?size=100&id=buti0ig4reqf&format=png&color=ffffff', rate: 10000 },
    { type: 'PC', name: 'PC #3', img: 'https://img.icons8.com/?size=100&id=buti0ig4reqf&format=png&color=ffffff', rate: 10000 },
    { type: 'PC', name: 'PC #4', img: 'https://img.icons8.com/?size=100&id=buti0ig4reqf&format=png&color=ffffff', rate: 10000 },
    { type: 'PC', name: 'PC #5', img: 'https://img.icons8.com/?size=100&id=buti0ig4reqf&format=png&color=ffffff', rate: 10000 },
    { type: 'PC', name: 'PC #6', img: 'https://img.icons8.com/?size=100&id=buti0ig4reqf&format=png&color=ffffff', rate: 10000 },
    { type: 'Bilardo', name: 'Bilardo Table', img: 'https://img.icons8.com/?size=100&id=PSYB5B3EHx6s&format=png&color=000000', rate: 30000 }
];

function groupSalesByPeriod(sales, period) {
    // period: 'day', 'week', 'month'
    const groups = {};
    sales.forEach(sale => {
        const date = new Date(sale.timestamp);
        let key;
        if (period === 'day') key = date.toISOString().slice(0, 10);
        else if (period === 'week') {
            const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
            key = firstDayOfWeek.toISOString().slice(0, 10);
        } else if (period === 'month') key = date.toISOString().slice(0, 7);
        if (!groups[key]) groups[key] = [];
        groups[key].push(sale);
    });
    return groups;
}

function App() {
    const [showSession, setShowSession] = useState(() => {
        const saved = localStorage.getItem('showSession');
        return saved !== null ? saved === 'true' : true;
    });
    // Load persisted state
    const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('loggedIn') === 'true');
    const [staffName, setStaffName] = useState(() => localStorage.getItem('staffName') || "");
    const [activeSessions, setActiveSessions] = useState(() => {
        const saved = localStorage.getItem('activeSessions');
        return saved ? JSON.parse(saved) : [];
    });
    const [monitoring, setMonitoring] = useState(() => localStorage.getItem('monitoring') === 'true');
    const [snack, setSnack] = useState("");
    const [snackQty, setSnackQty] = useState(1);
    const [snackPrice, setSnackPrice] = useState(10);

    // Local snack state for each session
    const [sessionSnacks, setSessionSnacks] = useState({});

    // Direct snack sale states
    const [snackError, setSnackError] = useState("");
    const [snackSuccess, setSnackSuccess] = useState("");
    const [rate, setRate] = useState(() => Number(localStorage.getItem('rate')) || 30);
    const [devices, setDevices] = useState(() => {
        const saved = localStorage.getItem('devices');
        return saved ? JSON.parse(saved) : initialDevices;
    });
    const [loading, setLoading] = useState(false);
    const [saleSummary, setSaleSummary] = useState(null);
    const [showReports, setShowReports] = useState(false);
    const [sales, setSales] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter states for reports
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Income analytics state
    const [incomeAnalytics, setIncomeAnalytics] = useState({
        day: { totalIncome: 0, count: 0 },
        month: { totalIncome: 0, count: 0 },
        year: { totalIncome: 0, count: 0 },
        devices: {
            PC: { totalIncome: 0, count: 0 },
            PS4: { totalIncome: 0, count: 0 },
            PS5: { totalIncome: 0, count: 0 },
            Bilardo: { totalIncome: 0, count: 0 }
        }
    });

    // Auth state
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') || "");
    const [role, setRole] = useState(() => localStorage.getItem('role') || "");

    // Sync loggedIn with authToken on mount
    useEffect(() => {
        if (authToken && !loggedIn) {
            setLoggedIn(true);
            localStorage.setItem('loggedIn', 'true');
        }
    }, [authToken]);
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // Registration state
    const [showRegister, setShowRegister] = useState(false);
    const [regUsername, setRegUsername] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regRole, setRegRole] = useState("staff");
    const [regError, setRegError] = useState("");
    const [regSuccess, setRegSuccess] = useState("");

    // Store management state
    const [showStore, setShowStore] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [newItemName, setNewItemName] = useState("");
    const [newItemStock, setNewItemStock] = useState(0);
    const [newItemPrice, setNewItemPrice] = useState(0);
    const [storeError, setStoreError] = useState("");
    const [storeSuccess, setStoreSuccess] = useState("");

    // Fetch sales and sessions for reports
    useEffect(() => {
        if (showReports) {
            axios.get(`${API_BASE}/sales`).then(res => setSales(res.data));
            axios.get(`${API_BASE}/sessions`).then(res => setSessions(res.data));

            // Fetch income analytics
            const fetchIncomeAnalytics = async () => {
                try {
                    const [dayRes, monthRes, yearRes, pcRes, ps4Res, ps5Res, bilardoRes] = await Promise.all([
                        axios.get(`${API_BASE}/income/day`),
                        axios.get(`${API_BASE}/income/month`),
                        axios.get(`${API_BASE}/income/year`),
                        axios.get(`${API_BASE}/income/device/PC`),
                        axios.get(`${API_BASE}/income/device/PS4`),
                        axios.get(`${API_BASE}/income/device/PS5`),
                        axios.get(`${API_BASE}/income/device/Bilardo`)
                    ]);

                    setIncomeAnalytics({
                        day: dayRes.data,
                        month: monthRes.data,
                        year: yearRes.data,
                        devices: {
                            PC: pcRes.data,
                            PS4: ps4Res.data,
                            PS5: ps5Res.data,
                            Bilardo: bilardoRes.data
                        }
                    });
                } catch (err) {
                    console.error('Error fetching income analytics:', err);
                }
            };

            fetchIncomeAnalytics();
        }
    }, [showReports]);

    // Fetch inventory for store management and snacks dropdown
    useEffect(() => {
        if (authToken) {
            axios.get(`${API_BASE}/inventory`).then(res => {
                setInventory(res.data);
                // Set default snack if not already set
                if (!snack && res.data.length > 0) {
                    setSnack(res.data[0].item);
                    setSnackPrice(res.data[0].price);
                }
                // Initialize session snacks for existing sessions
                setSessionSnacks(prev => {
                    const updated = { ...prev };
                    activeSessions.forEach((_, idx) => {
                        if (!updated[idx]) {
                            updated[idx] = { snack: res.data[0]?.item || "", qty: 1, price: res.data[0]?.price || 10 };
                        }
                    });
                    return updated;
                });
            });
        }
    }, [authToken, activeSessions.length]);

    // Auth login handler
    const handleAuthLogin = async () => {
        setLoginError("");
        if (!loginUsername.trim() || !loginPassword.trim()) {
            setLoginError("Username and password are required");
            return;
        }
        try {
            const res = await axios.post(`${API_BASE}/login`, {
                username: loginUsername.trim(),
                password: loginPassword
            });
            setAuthToken(res.data.token);
            setRole(res.data.role || 'staff');
            localStorage.setItem('authToken', res.data.token);
            localStorage.setItem('role', res.data.role || 'staff');
            setLoggedIn(true);
            setStaffName(loginUsername.trim());
            setLoginUsername("");
            setLoginPassword("");
        } catch (err) {
            setLoginError(err.response?.data?.message || err.response?.data?.error || "Login failed");
        }
    };

    // Signout handler
    const handleSignout = () => {
        setLoggedIn(false);
        setStaffName("");
        setAuthToken("");
        setRole("");
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('staffName');
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        // Optionally clear sessions if you want:
        // setActiveSessions([]);
        // localStorage.removeItem('activeSessions');
    };

    // Registration handler
    const handleRegister = async () => {
        setRegError("");
        setRegSuccess("");
        if (!regUsername.trim() || !regPassword.trim()) {
            setRegError("Username and password are required");
            return;
        }
        if (regPassword.length < 6) {
            setRegError("Password must be at least 6 characters long");
            return;
        }
        try {
            await axios.post(`${API_BASE}/register`, {
                username: regUsername.trim(),
                password: regPassword,
                role: regRole
            });
            setRegSuccess("Registration successful! You can now log in.");
            setShowRegister(false);
            setLoginUsername(regUsername.trim());
            setLoginPassword("");
            setRegUsername("");
            setRegPassword("");
        } catch (err) {
            setRegError(err.response?.data?.error || err.response?.data?.message || "Registration failed");
        }
    };

    // Add item
    const handleAddItem = async () => {
        setStoreError(""); setStoreSuccess("");
        if (!newItemName.trim()) {
            setStoreError("Item name required");
            return;
        }
        if (inventory.some(inv => inv.item === newItemName.trim())) {
            setStoreError("Item already exists");
            return;
        }
        const stockNum = Number(newItemStock);
        const priceNum = Number(newItemPrice);
        if (isNaN(stockNum) || stockNum < 0) {
            setStoreError("Stock must be a valid non-negative number");
            return;
        }
        if (isNaN(priceNum) || priceNum < 0) {
            setStoreError("Price must be a valid non-negative number");
            return;
        }
        try {
            await axios.post(`${API_BASE}/inventory/add`, { item: newItemName.trim(), stock: stockNum, price: priceNum });
            setStoreSuccess("Item added");
            setNewItemName(""); setNewItemStock(0); setNewItemPrice(0);
            const res = await axios.get(`${API_BASE}/inventory`);
            setInventory(res.data);
        } catch (err) {
            setStoreError(err.response?.data?.error || "Add failed");
        }
    };
    // Remove item
    const handleRemoveItem = async (id) => {
        setStoreError(""); setStoreSuccess("");
        try {
            await axios.delete(`${API_BASE}/inventory/${id}`);
            setStoreSuccess("Item removed");
            const res = await axios.get(`${API_BASE}/inventory`);
            setInventory(res.data);
        } catch (err) {
            setStoreError(err.response?.data?.error || "Remove failed");
        }
    };
    // Update stock
    const handleUpdateStock = async (id, delta) => {
        setStoreError(""); setStoreSuccess("");
        const inv = inventory.find(i => i._id === id);
        if (!inv) {
            setStoreError("Item not found");
            return;
        }
        if (inv.stock + delta < 0) {
            setStoreError("Stock cannot be negative");
            return;
        }
        try {
            await axios.patch(`${API_BASE}/inventory/${id}`, { stock: delta });
            setStoreSuccess("Stock updated");
            const res = await axios.get(`${API_BASE}/inventory`);
            setInventory(res.data);
        } catch (err) {
            setStoreError(err.response?.data?.error || "Update failed");
        }
    };

    // Update price
    const handleUpdatePrice = async (id, newPrice) => {
        setStoreError(""); setStoreSuccess("");
        const priceNum = Number(newPrice);
        if (isNaN(priceNum) || priceNum < 0) {
            setStoreError("Price must be a valid non-negative number");
            return;
        }
        try {
            await axios.patch(`${API_BASE}/inventory/${id}`, { price: priceNum });
            setStoreSuccess("Price updated");
            const res = await axios.get(`${API_BASE}/inventory`);
            setInventory(res.data);
        } catch (err) {
            setStoreError(err.response?.data?.error || "Update failed");
        }
    };


    const handleStartSession = (dev) => {
        const deviceRate = devices.find(d => d.name === dev.name)?.rate || rate;
        const newSessions = [...activeSessions, {
            device: dev,
            start: Date.now(),
            rate: deviceRate,
            snacks: []
        }];
        setActiveSessions(newSessions);
        localStorage.setItem('activeSessions', JSON.stringify(newSessions));
    };

    const handleAddSnack = (idx) => {
        const sessionSnack = sessionSnacks[idx] || { snack: "", qty: 1, price: 10 };
        if (!sessionSnack.snack) return; // Don't add if no snack selected

        const snackSale = {
            category: 'Snack',
            item: sessionSnack.snack,
            amount: sessionSnack.qty || 1,
            price: (sessionSnack.price || 10) * (sessionSnack.qty || 1)
        };

        // If session exists, add to session snacks
        if (activeSessions[idx]) {
            const updated = [...activeSessions];
            updated[idx].snacks.push(snackSale);
            setActiveSessions(updated);
            localStorage.setItem('activeSessions', JSON.stringify(updated));
        } else {
            // Direct snack sale without session
            handleDirectSnackSale(snackSale);
        }
    };

    const handleDirectSnackSale = async (snackSale) => {
        try {
            await axios.post(`${API_BASE}/sales`, snackSale);
            // Update inventory stock
            const inventoryItem = inventory.find(inv => inv.item === snackSale.item);
            if (inventoryItem) {
                await axios.patch(`${API_BASE}/inventory/${inventoryItem._id}`, {
                    stock: -snackSale.amount
                });
                // Refresh inventory
                const res = await axios.get(`${API_BASE}/inventory`);
                setInventory(res.data);
            }
            setSnackSuccess("Snack sale recorded successfully!");
            setTimeout(() => setSnackSuccess(""), 3000);
        } catch (err) {
            setSnackError("Failed to record snack sale");
            setTimeout(() => setSnackError(""), 3000);
        }
    };

    const handleEndSession = async (idx) => {
        setLoading(true);
        const session = activeSessions[idx];
        const end = Date.now();
        const durationMin = Math.round((end - session.start) / 60000);
        const charge = ((durationMin / 60) * session.rate).toFixed(2);
        await axios.post(`${API_BASE}/sessions`, {
            deviceType: session.device.name,
            startTime: new Date(session.start),
            endTime: new Date(end),
            duration: durationMin,
            charge: Number(charge)
        });
        const sessionSale = {
            category: session.device.type,
            item: session.device.name,
            amount: 1,
            price: Number(charge)
        };
        const allSales = [sessionSale, ...session.snacks];
        for (const sale of allSales) {
            await axios.post(`${API_BASE}/sales`, sale);
            if (sale.category === 'Snack') {
                // Find the inventory item and update its stock
                const inventoryItem = inventory.find(inv => inv.item === sale.item);
                if (inventoryItem) {
                    await axios.patch(`${API_BASE}/inventory/${inventoryItem._id}`, {
                        stock: -sale.amount
                    });
                }
            }
        }
        // Refresh inventory after stock update
        const updatedInventory = await axios.get(`${API_BASE}/inventory`);
        setInventory(updatedInventory.data);
        setSaleSummary({
            items: allSales,
            total: allSales.reduce((sum, s) => sum + s.price, 0),
            device: session.device.name
        });
        // Remove session from active
        const updatedSessions = activeSessions.filter((_, i) => i !== idx);
        setActiveSessions(updatedSessions);
        localStorage.setItem('activeSessions', JSON.stringify(updatedSessions));
        setLoading(false);
    };

    // Monitoring dashboard
    useEffect(() => {
        localStorage.setItem('monitoring', monitoring);
        let timer;
        if (monitoring) {
            timer = setInterval(() => {
                setActiveSessions(sessions => {
                    localStorage.setItem('activeSessions', JSON.stringify(sessions));
                    return [...sessions];
                }); // force update
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [monitoring]);

    // Persist rate changes
    useEffect(() => {
        localStorage.setItem('rate', rate);
    }, [rate]);

    // Persist devices changes
    useEffect(() => {
        localStorage.setItem('devices', JSON.stringify(devices));
    }, [devices]);

    // Reports UI
    const renderReports = () => {
        // Filter sales based on criteria
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.timestamp);
            const matchesCategory = !filterCategory || sale.category === filterCategory;
            const matchesStartDate = !filterStartDate || saleDate >= new Date(filterStartDate);
            const matchesEndDate = !filterEndDate || saleDate <= new Date(filterEndDate + 'T23:59:59');
            return matchesCategory && matchesStartDate && matchesEndDate;
        });

        const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentSales = filteredSales.slice(startIndex, endIndex);

        const handlePageChange = (page) => {
            setCurrentPage(page);
        };

        const clearFilters = () => {
            setFilterCategory('');
            setFilterStartDate('');
            setFilterEndDate('');
            setCurrentPage(1);
        };

        return (
            <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
                <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Reports Dashboard</h2>
                <button onClick={() => {
                    setShowReports(false);
                    setShowSession(true);
                    setCurrentPage(1);
                    localStorage.setItem('showReports', 'false');
                    localStorage.setItem('showSession', 'true');
                }} style={{ marginBottom: 20, padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>Back</button>

                <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ fontWeight: 600 }}>Category:
                        <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }} style={{ marginLeft: 10, padding: 8, borderRadius: 6, border: 'none', fontSize: 16 }}>
                            <option value="">All</option>
                            <option value="PS4">PS4</option>
                            <option value="PS5">PS5</option>
                            <option value="PC">PC</option>
                            <option value="Bilardo">Bilardo</option>
                            <option value="Snack">Snack</option>
                        </select>
                    </label>
                    <label style={{ fontWeight: 600 }}>Start Date:
                        <input type="date" value={filterStartDate} onChange={e => { setFilterStartDate(e.target.value); setCurrentPage(1); }} style={{ marginLeft: 10, padding: 8, borderRadius: 6, border: 'none', fontSize: 16 }} />
                    </label>
                    <label style={{ fontWeight: 600 }}>End Date:
                        <input type="date" value={filterEndDate} onChange={e => { setFilterEndDate(e.target.value); setCurrentPage(1); }} style={{ marginLeft: 10, padding: 8, borderRadius: 6, border: 'none', fontSize: 16 }} />
                    </label>
                    <button onClick={clearFilters} style={{ padding: 10, borderRadius: 8, background: '#ff5252', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>Clear Filters</button>
                </div>
                <table style={{ width: '100%', background: 'rgba(0,0,0,0.07)', borderRadius: 8, marginBottom: 20, textAlign: 'center' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.12)' }}>
                            <th style={{ padding: 10 }}>Date</th>
                            <th style={{ padding: 10 }}>Category</th>
                            <th style={{ padding: 10 }}>Item</th>
                            <th style={{ padding: 10 }}>Amount</th>
                            <th style={{ padding: 10 }}>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSales.map((sale, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.1)' }}>
                                <td style={{ padding: 10 }}>{new Date(sale.timestamp).toLocaleDateString()}</td>
                                <td style={{ padding: 10 }}>{sale.category}</td>
                                <td style={{ padding: 10 }}>{sale.item}</td>
                                <td style={{ padding: 10 }}>{sale.amount}</td>
                                <td style={{ padding: 10 }}>{sale.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ padding: 10, borderRadius: 8, background: currentPage === 1 ? '#555' : '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>
                    <span style={{ fontSize: 16 }}>Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ padding: 10, borderRadius: 8, background: currentPage === totalPages ? '#555' : '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
                {/* Income Analytics Section */}
                <div style={{ marginBottom: 30, padding: 20, background: 'rgba(0,0,0,0.1)', borderRadius: 12 }}>
                    <h3 style={{ textAlign: 'center', marginBottom: 20 }}>Income Analytics</h3>

                    {/* Time Period Analytics */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20, flexWrap: 'wrap', gap: 20 }}>
                        <div style={{ textAlign: 'center', padding: 15, background: 'rgba(42, 82, 152, 0.2)', borderRadius: 8, minWidth: 120 }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: 16 }}>Today</h4>
                            <bdi style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#00e676' }}>{incomeAnalytics.day.totalIncome.toFixed(0)} ل.س</bdi>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{incomeAnalytics.day.count} transactions</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: 15, background: 'rgba(42, 82, 152, 0.2)', borderRadius: 8, minWidth: 120 }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: 16 }}>This Month</h4>
                            <bdi style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#00e676' }}>{incomeAnalytics.month.totalIncome.toFixed(0)} ل.س</bdi>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{incomeAnalytics.month.count} transactions</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: 15, background: 'rgba(42, 82, 152, 0.2)', borderRadius: 8, minWidth: 120 }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: 16 }}>This Year</h4>
                            <bdi style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#00e676' }}>{incomeAnalytics.year.totalIncome.toFixed(0)} ل.س</bdi>
                            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>{incomeAnalytics.year.count} transactions</p>
                        </div>
                    </div>

                    {/* Device Type Analytics */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 15 }}>
                        {Object.entries(incomeAnalytics.devices).map(([device, data]) => (
                            <div key={device} style={{ textAlign: 'center', padding: 15, background: 'rgba(0, 229, 118, 0.1)', borderRadius: 8, minWidth: 100 }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: 14 }}>{device}</h4>
                                <bdi style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#00e676' }}>{data.totalIncome.toFixed(0)} ل.س</bdi>
                                <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{data.count} sessions</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Store Management UI
    const renderStore = () => (
        <div style={{ maxWidth: 800, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Store Management</h2>
            <button onClick={() => {
                setShowStore(false);
                setShowSession(true);
                localStorage.setItem('showStore', 'false');
                localStorage.setItem('showSession', 'true');
            }} style={{ marginBottom: 20, padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>Back</button>
            <div style={{ marginBottom: 30 }}>
                <h3>Add New Item</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <label style={{ fontWeight: 600 }}>
                        Item Name:
                        <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Enter item name" style={{ marginLeft: 10, padding: 8, borderRadius: 6, border: 'none', fontSize: 16, width: 150 }} />
                    </label>
                    <label style={{ fontWeight: 600 }}>
                        Initial Stock:
                        <input type="number" value={newItemStock} onChange={e => setNewItemStock(e.target.value)} placeholder="0" style={{ marginLeft: 10, padding: 8, borderRadius: 6, border: 'none', fontSize: 16, width: 100 }} />
                    </label>
                    <label style={{ fontWeight: 600 }}>
                        Price:
                        <input type="number" step="1" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="0.00" style={{ marginLeft: 10, padding: 8, borderRadius: 6, border: 'none', fontSize: 16, width: 80 }} />
                    </label>
                    <button onClick={handleAddItem} style={{ padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>Add Item</button>
                </div>
            </div>
            <h3>Inventory</h3>
            <table style={{ width: '100%', background: 'rgba(0,0,0,0.07)', borderRadius: 8, marginBottom: 20 }}>
                <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.12)' }}>
                        <th style={{ padding: 10 }}>Item</th>
                        <th style={{ padding: 10 }}>Stock</th>
                        <th style={{ padding: 10 }}>Price</th>
                        <th style={{ padding: 10 }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map(inv => (
                        <tr key={inv._id}>
                            <td style={{ padding: 10 }}>{inv.item}</td>
                            <td style={{ padding: 10 }}>{inv.stock}</td>
                            <td style={{ padding: 10 }}>
                                <input
                                    type="number"
                                    step="1"
                                    value={inv.price}
                                    onChange={e => {
                                        const val = e.target.value;
                                        const numVal = val === '' ? 0 : parseFloat(val);
                                        const updated = inventory.map(i => i._id === inv._id ? { ...i, price: isNaN(numVal) ? 0 : numVal } : i);
                                        setInventory(updated);
                                    }}
                                    onBlur={() => handleUpdatePrice(inv._id, inv.price)}
                                    style={{ padding: 4, borderRadius: 4, border: 'none', fontSize: 14, width: 80 }}
                                />
                            </td>
                            <td style={{ padding: 10 }}>
                                <button onClick={() => handleUpdateStock(inv._id, 1)} style={{ marginRight: 6, padding: 6, borderRadius: 6, background: '#2a5298', color: '#fff', border: 'none', fontWeight: 600 }}>+ Income</button>
                                <button onClick={() => handleUpdateStock(inv._id, -1)} style={{ marginRight: 6, padding: 6, borderRadius: 6, background: '#888', color: '#fff', border: 'none', fontWeight: 600 }}>- Output</button>
                                <button onClick={() => handleRemoveItem(inv._id)} style={{ padding: 6, borderRadius: 6, background: '#ff5252', color: '#fff', border: 'none', fontWeight: 600 }}>Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {storeError && <div style={{ color: '#ff5252', marginTop: 10, textAlign: 'center' }}>{storeError}</div>}
            {storeSuccess && <div style={{ color: '#00e676', marginTop: 10, textAlign: 'center' }}>{storeSuccess}</div>}
        </div>
    );

    // UI
    return (
        <div style={{ fontFamily: 'Montserrat, Arial', background: 'linear-gradient(135deg, #211936 0%, #2f2549ff 100%)', minHeight: '100vh', color: '#fff' }}>
            <header style={{ textAlign: 'center', padding: '2rem 0 1rem 0', background: '#211936' }}>
                <img src="/assets/spacex-logo.png" alt="SpaceX" style={{ height: 140, marginBottom: 10 }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: 2, color: 'white' }}>SpaceX Gaming Cafe</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Multi-session management & monitoring</p>
                {authToken && (
                    <div style={{ marginTop: 10, fontSize: 18, fontWeight: 600, color: '#fff', opacity: 0.85 }}>
                        Welcome, {staffName} ({role})
                    </div>
                )}
                {authToken && (
                    <div style={{ marginTop: 10 }}>
                        {role === 'admin' ? (
                            <>
                                <button onClick={() => {
                                    setShowReports(true);
                                    setShowSession(false);
                                    setShowStore(false);
                                    localStorage.setItem('showReports', 'true');
                                    localStorage.setItem('showSession', 'false');
                                    localStorage.setItem('showStore', 'false');
                                }} style={{ padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', marginRight: 10 }}>View Reports</button>
                                <button onClick={() => {
                                    setShowStore(true);
                                    setShowSession(false);
                                    setShowReports(false);
                                    localStorage.setItem('showStore', 'true');
                                    localStorage.setItem('showSession', 'false');
                                    localStorage.setItem('showReports', 'false');
                                }} style={{ padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', marginRight: 10 }}>Store Management</button>
                            </>
                        ) : null}
                        <button
                            onClick={() => {
                                setShowSession(true);
                                setShowReports(false);
                                setShowStore(false);
                                localStorage.setItem('showSession', 'true');
                                localStorage.setItem('showReports', 'false');
                                localStorage.setItem('showStore', 'false');
                            }}
                            style={{ padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}
                        >
                            Sessions
                        </button>
                        <button onClick={handleSignout} style={{ padding: 10, borderRadius: 8, background: '#ff5252', color: '#fff', fontWeight: 600, fontSize: 16, marginLeft: 10, border: 'none', cursor: 'pointer' }}>Sign Out</button>

                    </div>
                )}
            </header>
            {showStore ? renderStore() : (showReports ? (role === 'admin' ? renderReports() : (
                <div style={{ maxWidth: 400, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002', textAlign: 'center' }}>
                    <h2>Access Denied</h2>
                    <p>Only admin users can view reports.</p>
                    <button onClick={() => {
                        setShowReports(false);
                        setShowSession(true);
                        localStorage.setItem('showReports', 'false');
                        localStorage.setItem('showSession', 'true');
                    }} style={{ marginTop: 20, padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>Back</button>
                </div>
            )) : (
                <>
                    {!authToken && !showRegister && (
                        <div style={{ maxWidth: 400, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
                            <h2 style={{ textAlign: 'center' }}>User Login</h2>
                            <input value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="Username" style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: 'none', fontSize: 18 }} />
                            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: 'none', fontSize: 18 }} />
                            <button onClick={handleAuthLogin} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', cursor: 'pointer' }}>Login</button>
                            <button onClick={() => setShowRegister(true)} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#888', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 10 }}>Register</button>
                            {loginError && <div style={{ color: '#ff5252', marginTop: 10, textAlign: 'center' }}>{loginError}</div>}
                            {regSuccess && <div style={{ color: '#00e676', marginTop: 10, textAlign: 'center' }}>{regSuccess}</div>}
                        </div>
                    )}
                    {!authToken && showRegister && (
                        <div style={{ maxWidth: 400, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
                            <h2 style={{ textAlign: 'center' }}>Register New User</h2>
                            <input value={regUsername} onChange={e => setRegUsername(e.target.value)} placeholder="Username" style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: 'none', fontSize: 18 }} />
                            <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Password" style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: 'none', fontSize: 18 }} />
                            <select value={regRole} onChange={e => setRegRole(e.target.value)} style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: 'none', fontSize: 18 }}>
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                            </select>
                            <button onClick={handleRegister} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', cursor: 'pointer' }}>Register</button>
                            <button onClick={() => setShowRegister(false)} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#888', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer', marginTop: 10 }}>Back to Login</button>
                            {regError && <div style={{ color: '#ff5252', marginTop: 10, textAlign: 'center' }}>{regError}</div>}
                        </div>
                    )}
                    {authToken && (
                        <>
                            {/* Only show main app if logged in */}
                            {loggedIn && showSession && (
                                <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
                                    <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Start New Session</h2>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'center' }}>
                                        {devices.map((dev, idx) => (
                                            <div key={dev.name} style={{ width: 160, height: 220, background: 'rgba(0,0,0,0.15)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px #0002', transition: 'transform 0.2s', border: activeSessions.some(s => s.device.name === dev.name) ? '2px solid  #1aeefd' : '2px solid #2a5298', opacity: activeSessions.some(s => s.device.name === dev.name) ? 1 : 0.5 }} onClick={() => !activeSessions.some(s => s.device.name === dev.name) && handleStartSession(dev)}>
                                                <img src={dev.img} alt={dev.name} style={{ width: 80, height: 80, marginBottom: 10 }} />
                                                <span style={{ fontWeight: 600, fontSize: 18 }}>{dev.name}</span>
                                                <span style={{ fontSize: 14, opacity: 0.7, color: '#b95ed6' }}>{dev.type}</span>
                                                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                    <label style={{ fontSize: 14, marginBottom: 8 }}>Rate/hr:</label>
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        value={dev.rate}
                                                        onChange={e => {
                                                            const newDevices = [...devices];
                                                            newDevices[idx].rate = Number(e.target.value);
                                                            setDevices(newDevices);
                                                            localStorage.setItem('devices', JSON.stringify(newDevices));
                                                        }}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{ padding: 5, borderRadius: 4, border: 'none', fontSize: 12, width: 60, textAlign: 'center', background: 'rgba(255,255,255,0.9)', color: '#000' }}
                                                    />
                                                </div>
                                                {/* {activeSessions.some(s => s.device.name === dev.name) && <span style={{ color: '#ff5252', fontWeight: 700, marginTop: 8 }}>Active</span>} */}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                                        {/* <div style={{ marginBottom: 20 }}>
                                            <label style={{ fontWeight: 600 }}>Default Rate (per hour):
                                                <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: 'none', fontSize: 16, width: 80 }} />
                                            </label>
                                        </div> */}

                                        {/* Direct Snack Sale Section */}
                                        <div style={{ marginBottom: 30, padding: 20, background: 'rgba(0,0,0,0.1)', borderRadius: 12 }}>
                                            <h4 style={{ marginBottom: 15 }}>Quick Snack/Drink Sale</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                                                <label style={{ fontWeight: 600 }}>Snack/Drink:
                                                    <select
                                                        value={snack}
                                                        onChange={e => {
                                                            setSnack(e.target.value);
                                                            const selectedItem = inventory.find(item => item.item === e.target.value);
                                                            if (selectedItem) setSnackPrice(selectedItem.price);
                                                        }}
                                                        style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: 'none', fontSize: 16 }}
                                                    >
                                                        <option value="">Select Snack</option>
                                                        {inventory.map(item => <option key={item._id} value={item.item}>{item.item} ({item.stock} left)</option>)}
                                                    </select>
                                                </label>
                                                <label style={{ fontWeight: 600 }}>Qty:
                                                    <input type="number" min={1} value={snackQty} onChange={e => setSnackQty(Number(e.target.value))} style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: 'none', fontSize: 16, width: 60, textAlign: 'center' }} />
                                                </label>
                                                <label style={{ fontWeight: 600 }}>Price:
                                                    <input type="number" min={0} step="1" value={snackPrice} onChange={e => setSnackPrice(Number(e.target.value))} style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: 'none', fontSize: 16, width: 80, textAlign: 'center' }} />
                                                </label>
                                                <button
                                                    onClick={() => {
                                                        if (!snack) return;
                                                        const snackSale = {
                                                            category: 'Snack',
                                                            item: snack,
                                                            amount: snackQty,
                                                            price: snackPrice * snackQty
                                                        };
                                                        handleDirectSnackSale(snackSale);
                                                    }}
                                                    style={{ padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}
                                                >
                                                    Quick Sale
                                                </button>
                                            </div>
                                            {snackError && <div style={{ color: '#ff5252', marginTop: 10 }}>{snackError}</div>}
                                            {snackSuccess && <div style={{ color: '#00e676', marginTop: 10 }}>{snackSuccess}</div>}
                                        </div>

                                        {/* <button onClick={() => setMonitoring(!monitoring)} style={{ padding: 10, borderRadius: 8, background: monitoring ? '#ff5252' : '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>{monitoring ? 'Stop Monitoring' : 'Start Monitoring'}</button> */}
                                    </div>
                                </div>
                            )}
                            {loggedIn && monitoring && (
                                <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002' }}>
                                    <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Active Sessions Monitoring</h2>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'center' }}>
                                        {activeSessions.map((session, idx) => (
                                            <div key={session.device.name} style={{ width: 320, background: 'rgba(0,0,0,0.15)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0002', border: '2px solid #1aeefd', padding: 20 }}>
                                                <img src={session.device.img} alt={session.device.name} style={{ width: 80, height: 80, marginBottom: 10 }} />
                                                <span style={{ fontWeight: 600, fontSize: 22 }}>{session.device.name}</span>
                                                <span style={{ fontSize: 16, opacity: 0.7 }}>{session.device.type}</span>
                                                <span style={{ fontSize: 16, margin: '10px 0', color: '#fff' }}>Started: {new Date(session.start).toLocaleTimeString()}</span>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: '#00e676' }}>Elapsed: {Math.round((Date.now() - session.start) / 60000)} min</span>
                                                <span style={{ fontSize: 16, margin: '10px 0', color: '#fff' }}>Rate: {session.rate} / hour</span>
                                                <button onClick={() => handleEndSession(idx)} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', cursor: 'pointer', margin: '10px 0' }}>End Session</button>
                                                <div style={{ width: '100%', marginTop: 10 }}>
                                                    <h4 style={{ textAlign: 'center', marginBottom: 10 }}>Add Snack/Drink Sale</h4>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                                                        <label style={{ fontWeight: 600 }}>Snack/Drink:
                                                            <select
                                                                value={sessionSnacks[idx]?.snack || ""}
                                                                onChange={e => {
                                                                    const selectedItem = inventory.find(item => item.item === e.target.value);
                                                                    setSessionSnacks(prev => ({
                                                                        ...prev,
                                                                        [idx]: {
                                                                            ...prev[idx],
                                                                            snack: e.target.value,
                                                                            qty: prev[idx]?.qty || 1,
                                                                            price: selectedItem ? selectedItem.price : (prev[idx]?.price || 10)
                                                                        }
                                                                    }));
                                                                }}
                                                                style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: 'none', fontSize: 16 }}
                                                            >
                                                                <option value="">Select Snack</option>
                                                                {inventory.map(item => <option key={item._id} value={item.item}>{item.item} ({item.stock} left)</option>)}
                                                            </select>
                                                        </label>
                                                        <label style={{ fontWeight: 600 }}>Qty:
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={sessionSnacks[idx]?.qty || 1}
                                                                onChange={e => {
                                                                    const val = Number(e.target.value);
                                                                    setSessionSnacks(prev => ({
                                                                        ...prev,
                                                                        [idx]: {
                                                                            snack: prev[idx]?.snack || "",
                                                                            qty: isNaN(val) ? 1 : val,
                                                                            price: prev[idx]?.price || 10
                                                                        }
                                                                    }));
                                                                }}
                                                                style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: 'none', fontSize: 16, width: 60, textAlign: 'center' }}
                                                            />
                                                        </label>
                                                        <label style={{ fontWeight: 600 }}>Price:
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                step="1"
                                                                value={sessionSnacks[idx]?.price || 10}
                                                                onChange={e => {
                                                                    const val = Number(e.target.value);
                                                                    setSessionSnacks(prev => ({
                                                                        ...prev,
                                                                        [idx]: {
                                                                            snack: prev[idx]?.snack || "",
                                                                            qty: prev[idx]?.qty || 1,
                                                                            price: isNaN(val) ? 10 : val
                                                                        }
                                                                    }));
                                                                }}
                                                                style={{ marginLeft: 10, padding: 6, borderRadius: 6, border: 'none', fontSize: 16, width: 80, textAlign: 'center' }}
                                                            />
                                                        </label>
                                                        <button onClick={() => handleAddSnack(idx)} style={{ padding: 10, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer' }}>Add Sale</button>
                                                    </div>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                        {session.snacks.map((sale, sidx) => (
                                                            <li key={sidx} style={{ background: 'rgba(0,0,0,0.12)', margin: '8px 0', padding: 10, borderRadius: 8, fontSize: 16 }}>
                                                                {sale.amount} x {sale.item} @ {sale.price / sale.amount} = {sale.price}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {saleSummary && (
                                <div style={{ maxWidth: 600, margin: '2rem auto', padding: 30, background: 'rgba(255,255,255,0.07)', borderRadius: 16, boxShadow: '0 4px 24px #0002', textAlign: 'center' }}>
                                    <h2>Sale Summary for {saleSummary.device}</h2>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {saleSummary.items.map((item, idx) => (
                                            <li key={idx} style={{ background: 'rgba(0,0,0,0.12)', margin: '8px 0', padding: 10, borderRadius: 8, fontSize: 16 }}>
                                                {item.category}: {item.item} - {item.amount} x {item.price / item.amount} = {item.price}
                                            </li>
                                        ))}
                                    </ul>
                                    <h3 style={{ fontSize: 24, margin: '20px 0' }}>Total: {saleSummary.total}</h3>
                                    <p>Stock reduced automatically for snacks/drinks.</p>
                                    <button onClick={() => setSaleSummary(null)} style={{ padding: 14, borderRadius: 8, background: '#2a5298', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', cursor: 'pointer', marginTop: 20 }}>Close</button>
                                </div>
                            )}
                        </>
                    )}
                </>
            ))}
            <footer style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.7, fontSize: 16 }}>
                &copy; {new Date().getFullYear()} SpaceX Gaming Cafe. All rights reserved.
            </footer>
        </div>
    );
}

export default App;
