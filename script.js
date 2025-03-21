// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfsD3sbYZ6Iir9UhJS2cBKlqthbKyE_kk",
    authDomain: "grain-monitoring-system-cbd0d.firebaseapp.com",
    databaseURL: "https://grain-monitoring-system-cbd0d-default-rtdb.firebaseio.com",
    projectId: "grain-monitoring-system-cbd0d",
    storageBucket: "grain-monitoring-system-cbd0d.firebasestorage.app",
    messagingSenderId: "835767171802",
    appId: "1:835767171802:web:92373bb5c0c271e77803e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Reference to real-time data
const testRef = ref(database, "test");
const historyRef = ref(database, "test/readings");

// Listen for real-time changes
onValue(testRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        document.getElementById("moisture").innerText = data._moisture + "%";
        document.getElementById("temperature").innerText = data._temperature + "°C";
        document.getElementById("humidity").innerText = data._humidity + "%";
        document.getElementById("status").innerText = data._status;

        // Check if grain status is NOT OKAY and send a notification
        if (data._status.toLowerCase() !== "okay") {
            sendNotification("Alert! Grain quality is not okay.");
        }
    }
});

// Load last 10 readings
onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const keys = Object.keys(data).slice(-10); // Get last 10 timestamps
        const historyList = document.getElementById("history-list");
        historyList.innerHTML = "";

        keys.forEach((timestamp) => {
            const entry = data[timestamp];
            const date = new Date(parseInt(timestamp));

            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <strong>${formatDate(date)}</strong><br>
                Temperature: ${entry.temperature}°C, 
                Humidity: ${entry.humidity}%, 
                Moisture: ${entry.moisture}%
            `;
            historyList.appendChild(listItem);
        });
    }
});

// Filter readings by date range
window.filterHistory = function () {
    const startDate = new Date(document.getElementById("start-date").value).getTime();
    const endDate = new Date(document.getElementById("end-date").value).getTime();

    if (!startDate || !endDate) {
        alert("Please select a valid date range.");
        return;
    }

    onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const keys = Object.keys(data);
            const historyList = document.getElementById("history-list");
            historyList.innerHTML = "";

            keys.forEach((timestamp) => {
                const timestampNum = parseInt(timestamp);
                if (timestampNum >= startDate && timestampNum <= endDate) {
                    const entry = data[timestamp];
                    const date = new Date(timestampNum);

                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <strong>${formatDate(date)}</strong><br>
                        Temperature: ${entry.temperature}°C
                        Humidity: ${entry.humidity}%
                        Moisture: ${entry.moisture}%
                    `;
                    historyList.appendChild(listItem);
                }
            });
        }
    });
};

// Function to format date
function formatDate(date) {
    return date.toLocaleDateString() + ", " + date.toLocaleTimeString();
}

// Function to send browser notifications
function sendNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("Grain Monitoring Alert", { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification("Grain Monitoring Alert", { body: message });
            }
        });
    }
}
