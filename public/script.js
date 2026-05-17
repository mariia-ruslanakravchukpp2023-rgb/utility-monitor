async function getCurrentUser() {
  const response = await fetch("/api/auth/me");

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.user;
}

async function checkUser() {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return null;
  }

  return user;
}

async function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();
  alert(data.message);

  if (response.ok) {
    window.location.href = "login.html";
  }
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  alert(data.message);

  if (response.ok) {
    window.location.href = "dashboard.html";
  }
}

async function addReading() {
  const user = await checkUser();

  if (!user) {
    return;
  }

  const type = document.getElementById("utilityType").value;
  const value = Number(document.getElementById("value").value);
  const price = Number(document.getElementById("price").value);

  if (!value || !price) {
    alert("Введіть споживання і ціну");
    return;
  }

  const response = await fetch("/api/readings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userEmail: user.email,
      type,
      value,
      price
    })
  });

  const data = await response.json();
  alert(data.message);

  if (response.ok) {
    window.location.href = "history.html";
  }
}

async function loadHistory() {
  const user = await checkUser();

  if (!user) {
    return;
  }

  const response = await fetch(`/api/readings/${user.email}`);
  const readings = await response.json();

  const table = document.getElementById("readingsTable");
  table.innerHTML = "";

  readings.forEach((reading) => {
    const row = `
      <tr>
        <td>${reading.type}</td>
        <td>${reading.value}</td>
        <td>${reading.price}</td>
        <td>${reading.totalCost.toFixed(2)}</td>
        <td>${new Date(reading.date).toLocaleDateString("uk-UA")}</td>
        <td>
          <button class="delete-btn" onclick="deleteReading('${reading._id}')">
            Видалити
          </button>
        </td>
      </tr>
    `;

    table.innerHTML += row;
  });
}

async function deleteReading(id) {
  const response = await fetch(`/api/readings/${id}`, {
    method: "DELETE"
  });

  const data = await response.json();
  alert(data.message);

  loadHistory();
}

async function loadDashboard() {
  const user = await checkUser();

  if (!user) {
    return;
  }

  document.getElementById("userInfo").innerText =
    `Користувач: ${user.name} (${user.email})`;

  const response = await fetch(`/api/readings/${user.email}`);
  const readings = await response.json();

  let total = 0;
  let maxType = "—";
  let maxValue = 0;
  const totalsByType = {};

  readings.forEach((reading) => {
    total += reading.totalCost;

    if (!totalsByType[reading.type]) {
      totalsByType[reading.type] = 0;
    }

    totalsByType[reading.type] += reading.totalCost;
  });

  for (const type in totalsByType) {
    if (totalsByType[type] > maxValue) {
      maxValue = totalsByType[type];
      maxType = type;
    }
  }

  document.getElementById("dashTotal").innerText = total.toFixed(2);
  document.getElementById("dashCount").innerText = readings.length;
  document.getElementById("dashMax").innerText = maxType;
}

async function loadAnalytics() {
  const user = await checkUser();

  if (!user) {
    return;
  }

  const response = await fetch(`/api/readings/${user.email}`);
  const readings = await response.json();

  let electricity = 0;
  let water = 0;
  let gas = 0;
  let heating = 0;

  readings.forEach((reading) => {
    if (reading.type === "Електроенергія") {
      electricity += reading.totalCost;
    }

    if (reading.type === "Вода") {
      water += reading.totalCost;
    }

    if (reading.type === "Газ") {
      gas += reading.totalCost;
    }

    if (reading.type === "Опалення") {
      heating += reading.totalCost;
    }
  });

  document.getElementById("electricityTotal").innerText = electricity.toFixed(2);
  document.getElementById("waterTotal").innerText = water.toFixed(2);
  document.getElementById("gasTotal").innerText = gas.toFixed(2);
  document.getElementById("heatingTotal").innerText = heating.toFixed(2);

  const totals = {
    "електроенергія": electricity,
    "вода": water,
    "газ": gas,
    "опалення": heating
  };

  let maxName = "немає даних";
  let maxValue = 0;

  for (const name in totals) {
    if (totals[name] > maxValue) {
      maxValue = totals[name];
      maxName = name;
    }
  }

  document.getElementById("analyticsConclusion").innerText =
    maxValue > 0
      ? `Найбільші витрати зараз припадають на: ${maxName}. Рекомендується звернути увагу на цю категорію для економії.`
      : "Поки що немає достатньо даних для аналізу.";
}
function toggleMenu() {
  document
    .getElementById("sideMenu")
    .classList.toggle("show-menu");
}