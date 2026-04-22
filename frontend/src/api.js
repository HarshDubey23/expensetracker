const BASE_URL = "https://expensetracker-3-30w4.onrender.com/api";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const addExpense = async (data) => {
  const res = await fetch(`${BASE_URL}/expense`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getExpenses = async () => {
  const res = await fetch(`${BASE_URL}/expenses`, { headers: headers() });
  return res.json();
};

export const deleteExpense = async (id) => {
  const res = await fetch(`${BASE_URL}/expense/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return res.json();
};

export const getTotal = async () => {
  const res = await fetch(`${BASE_URL}/expense-total`, { headers: headers() });
  return res.json();
};