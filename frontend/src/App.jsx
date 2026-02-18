import React from "react";
import { useEffect, useState } from "react";
import { getEmployees, addEmployee, deleteEmployee, getAttendance, markAttendance } from "./api";


function App() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [attendance, setAttendance] = useState([]);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await addEmployee(form);
      setForm({ employee_id: "", full_name: "", email: "", department: "" });
      loadEmployees();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id) {
    await deleteEmployee(id);
    loadEmployees();
  }

  async function loadAttendance(emp) {
    setSelectedEmp(emp);
    const data = await getAttendance(emp.id);
    setAttendance(data);
  }

  async function handleMark(status) {
    const today = new Date().toISOString().split("T")[0];
    await markAttendance(selectedEmp.id, { date: today, status });
    loadAttendance(selectedEmp);
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial" }}>
      <h1>HRMS Lite</h1>

      <h2>Add Employee</h2>
      <form onSubmit={handleAdd} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Employee ID" value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required />
        <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required />
        <button>Add</button>
      </form>

      <h2>Employees</h2>
      {employees.length === 0 ? <p>No employees yet.</p> : (
        <ul>
          {employees.map(emp => (
            <li key={emp.id} style={{ marginBottom: 8 }}>
              <b>{emp.full_name}</b> ({emp.department}) - {emp.email}
              <button onClick={() => loadAttendance(emp)} style={{ marginLeft: 8 }}>Attendance</button>
              <button onClick={() => handleDelete(emp.id)} style={{ marginLeft: 8, color: "red" }}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      {selectedEmp && (
        <>
          <h2>Attendance for {selectedEmp.full_name}</h2>
          <button onClick={() => handleMark("Present")}>Mark Present</button>
          <button onClick={() => handleMark("Absent")} style={{ marginLeft: 8 }}>Mark Absent</button>

          {attendance.length === 0 ? <p>No records yet.</p> : (
            <ul>
              {attendance.map(a => (
                <li key={a.id}>{a.date} - {a.status}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;
