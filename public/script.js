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

  document.getElementById("hasBoiler").value = String(user.hasBoiler);
  document.getElementById("hasDualZoneMeter").value =
    String(user.hasDualZoneMeter);
  document.getElementById("peopleCount").value = user.peopleCount || 1;

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

async function saveRecommendationSettings() {
  const hasBoiler =
    document.getElementById("hasBoiler").value === "true";

  const hasDualZoneMeter =
    document.getElementById("hasDualZoneMeter").value === "true";

  const peopleCount =
    Number(document.getElementById("peopleCount").value);

  if (!peopleCount || peopleCount < 1) {
    alert("Введіть коректну кількість мешканців");
    return;
  }

  const response = await fetch("/api/auth/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      hasBoiler,
      hasDualZoneMeter,
      peopleCount
    })
  });

  const data = await response.json();
  alert(data.message);
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

  document.getElementById("electricityTotal").innerText =
    electricity.toFixed(2);
  document.getElementById("waterTotal").innerText = water.toFixed(2);
  document.getElementById("gasTotal").innerText = gas.toFixed(2);
  document.getElementById("heatingTotal").innerText = heating.toFixed(2);

  const electricityTariff = 4.32;
  const boilerKwhPerPerson = 120;

  const costWithoutBoiler = water;

  const costWithBoiler =
    water * 0.5 +
    user.peopleCount * boilerKwhPerPerson * electricityTariff;

  const boilerSaving =
    costWithoutBoiler - costWithBoiler;

  const costWithoutDualZone = electricity;



const nightUsagePercent =
  0.2 + user.peopleCount * 0.05;

const safeNightPercent =
  Math.min(nightUsagePercent, 0.6);

const costWithDualZone =
  electricity * (1 - safeNightPercent) +
  electricity * safeNightPercent * 0.5;

const dualZoneSaving =
  costWithoutDualZone - costWithDualZone;



const heatingEfficiency =
  0.1 + user.peopleCount * 0.02;

const safeHeatingEfficiency =
  Math.min(heatingEfficiency, 0.25);

const heatingSaving =
  heating * safeHeatingEfficiency;



const gasEfficiency =
  0.12 + user.peopleCount * 0.02;

const safeGasEfficiency =
  Math.min(gasEfficiency, 0.3);

const gasSaving =
  gas * safeGasEfficiency;

  let recommendations = [];

  if (readings.length === 0) {
    recommendations.push(
      "Поки що немає достатньо даних для аналізу. Додайте показники комунальних послуг."
    );
  }

  if (
    !user.hasBoiler &&
    water > 1000 &&
    boilerSaving > 500
  ) {
    recommendations.push(
      `Вода: система порівняла витрати без бойлера та з бойлером.

Витрати без бойлера: ${costWithoutBoiler.toFixed(2)} грн.
Орієнтовні витрати з бойлером: ${costWithBoiler.toFixed(2)} грн.
Можлива економія: ${boilerSaving.toFixed(2)} грн.

Рекомендація: встановлення бойлера може бути економічно вигідним.`
    );
  }

  if (
    !user.hasDualZoneMeter &&
    electricity > 1000 &&
    dualZoneSaving > 300
  ) {
    recommendations.push(
      `Електроенергія: система порівняла звичайний тариф і двозонний лічильник.

Витрати без двозонного лічильника: ${costWithoutDualZone.toFixed(2)} грн.
Орієнтовні витрати з двозонним лічильником: ${costWithDualZone.toFixed(2)} грн.
Можлива економія: ${dualZoneSaving.toFixed(2)} грн.

Рекомендація: встановлення двозонного лічильника може бути економічно вигідним.`
    );
  }

  if (
    heating > 4000 &&
    heatingSaving > 500
  ) {
    recommendations.push(
      `Опалення: система визначила високі витрати.

Поточні витрати на опалення: ${heating.toFixed(2)} грн.
Орієнтовна можлива економія після встановлення терморегуляторів: ${heatingSaving.toFixed(2)} грн.

Рекомендація: варто розглянути встановлення терморегуляторів або утеплення вікон.`
    );
  }

  if (
    gas > 3500 &&
    gasSaving > 500
  ) {
    recommendations.push(
      `Газ: система визначила високі витрати.

Поточні витрати на газ: ${gas.toFixed(2)} грн.
Орієнтовна можлива економія після перевірки або оновлення газового обладнання: ${gasSaving.toFixed(2)} грн.

Рекомендація: варто перевірити ефективність газового обладнання та утеплення приміщення.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Критичних перевитрат не виявлено ."
    );
  }

  document.getElementById("analyticsConclusion").innerText =
    recommendations.join("\n\n \n\n");
}

function toggleMenu() {
  document
    .getElementById("sideMenu")
    .classList.toggle("show-menu");
}