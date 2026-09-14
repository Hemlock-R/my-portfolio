const loginForm = document.querySelector("#loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = "/admin/dashboard.html";
    } else {
      alert(result.message);
    }
  });
}

const contactsTable = document.querySelector("#contactsTable");

if (contactsTable) {
  loadContacts();
}

async function loadContacts() {
  const response = await fetch("/api/admin/contacts");
  const contacts = await response.json();

  if (!response.ok) {
    alert(contacts.message);
    return;
  }

  contactsTable.innerHTML = "";

  contacts.forEach((contact) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${contact.id}</td>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.phone}</td>
            <td>${contact.message}</td>
            <td>${contact.created_at}</td>
        `;

    contactsTable.appendChild(row);
  });
}

const logoutButton = document.querySelector("#logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    const response = await fetch("/api/admin/logout", {
      method: "POST",
    });

    if (response.ok) {
      window.location.href = "/admin/login.html";
    }
  });
}
