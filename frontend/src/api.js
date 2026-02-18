
const API_URL = "https://quesscorp-assessment.onrender.com";

export async function getEmployees() {
  const res = await fetch(`${API_URL}/employees`);
  if (!res.ok) throw new Error("Failed to load employees");
  return res.json();
}

export async function addEmployee(data) {
  const res = await fetch(`${API_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to add employee");
  }
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_URL}/employees/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

export async function getAttendance(id) {
  const res = await fetch(`${API_URL}/employees/${id}/attendance`);
  if (!res.ok) throw new Error("Failed to load attendance");
  return res.json();
}

export async function markAttendance(id, data) {
  const res = await fetch(`${API_URL}/employees/${id}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to mark attendance");
  return res.json();
}
