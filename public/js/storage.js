// Storage management - supports both localStorage and database sync

const API_URL = '';  // Empty for same-origin requests

// Get current logged-in user
export function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Set current user
export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

// Check if user is logged in
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

// Logout
export function logout() {
  localStorage.removeItem('currentUser');
}

// Sync data to server if logged in
async function syncToServer(dataType, data) {
  const user = getCurrentUser();
  if (!user || !user.id) return;

  try {
    await fetch(`${API_URL}/api/user/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        [dataType]: data
      })
    });
  } catch (error) {
    console.error('Failed to sync to server:', error);
  }
}

// Fitness Plan
export function savePlan(plan) {
  localStorage.setItem('fitnessPlan', JSON.stringify(plan));
  syncToServer('fitnessPlan', plan);
}

export function getPlan() {
  const plan = localStorage.getItem('fitnessPlan');
  return plan ? JSON.parse(plan) : null;
}

export function hasCompletedOnboarding() {
  return localStorage.getItem('fitnessPlan') !== null;
}

// Tracking Logs
export function saveTrackingLog(log) {
  const logs = getTrackingLogs();
  logs.push(log);
  localStorage.setItem('trackingLogs', JSON.stringify(logs));
  syncToServer('trackingLogs', logs);
}

export function getTrackingLogs() {
  const logs = localStorage.getItem('trackingLogs');
  return logs ? JSON.parse(logs) : [];
}

// Progress Entries
export function saveProgressEntry(entry) {
  const entries = getProgressEntries();
  entries.push(entry);
  localStorage.setItem('progressEntries', JSON.stringify(entries));
  syncToServer('progressEntries', entries);
}

export function getProgressEntries() {
  const entries = localStorage.getItem('progressEntries');
  return entries ? JSON.parse(entries) : [];
}

// Meal Logs
export function saveMealLog(meal) {
  const meals = getMealLogs();
  meals.push(meal);
  localStorage.setItem('mealLogs', JSON.stringify(meals));
  syncToServer('mealLogs', meals);
}

export function getMealLogs() {
  const meals = localStorage.getItem('mealLogs');
  return meals ? JSON.parse(meals) : [];
}

// Clear all data
export function clearAllData() {
  localStorage.removeItem('fitnessPlan');
  localStorage.removeItem('trackingLogs');
  localStorage.removeItem('progressEntries');
  localStorage.removeItem('mealLogs');
}

// Locale storage
export function getStoredLocale() {
  return localStorage.getItem('locale') || 'en';
}

export function setStoredLocale(locale) {
  localStorage.setItem('locale', locale);
}

// Load user data from server (called after login)
export function loadUserData(userData) {
  if (userData.fitnessPlan) {
    localStorage.setItem('fitnessPlan', JSON.stringify(userData.fitnessPlan));
  }
  if (userData.trackingLogs && userData.trackingLogs.length > 0) {
    localStorage.setItem('trackingLogs', JSON.stringify(userData.trackingLogs));
  }
  if (userData.progressEntries && userData.progressEntries.length > 0) {
    localStorage.setItem('progressEntries', JSON.stringify(userData.progressEntries));
  }
  if (userData.mealLogs && userData.mealLogs.length > 0) {
    localStorage.setItem('mealLogs', JSON.stringify(userData.mealLogs));
  }
}

// Auth API calls
export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const userData = await response.json();

  // Save user session
  setCurrentUser({
    id: userData.id,
    email: userData.email,
    name: userData.name
  });

  // Load user's data into localStorage
  loadUserData(userData);

  return userData;
}

export async function signupUser(email, password, name) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  const userData = await response.json();

  // Save user session
  setCurrentUser({
    id: userData.id,
    email: userData.email,
    name: userData.name
  });

  return userData;
}
