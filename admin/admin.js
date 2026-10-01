let csrfToken = localStorage.getItem("csrfToken");

const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  function checkAdminSession() {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((result) => {
        if (result.authenticated) {
          window.location.replace("/admin/dashboard.html");
        }
      });
  }

  checkAdminSession();

  window.addEventListener("pageshow", function () {
    checkAdminSession();
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    const submitButton = loginForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

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
      // Keep "Signing in..." visible briefly
      await new Promise(function (resolve) {
        setTimeout(resolve, 700);
      });

      submitButton.textContent = "✓ Signed in";

      await new Promise(function (resolve) {
        setTimeout(resolve, 1000);
      });

      localStorage.setItem("csrfToken", result.csrfToken);
      window.location.href = "/admin/dashboard.html";
    } else {
      const loginMessage = document.querySelector("#loginMessage");

      if (loginMessage) {
        loginMessage.textContent = result.message;
        loginMessage.className = "login-error";
      }

      submitButton.disabled = false;
      submitButton.textContent = "Login";
    }
  });
}

const loginMessage = document.querySelector("#loginMessage");

function clearLoginMessage() {
  if (loginMessage) {
    loginMessage.textContent = "";
    loginMessage.className = "";
  }
}

if (loginForm) {
  loginForm.addEventListener("input", clearLoginMessage);
  loginForm.addEventListener("focusin", clearLoginMessage);
}


const contactsTable = document.querySelector("#contactsTable");

if (contactsTable) {
  loadContacts();
}

let allContacts = [];

let filteredContacts = [];
let currentPage = 1;
const contactsPerPage = 10;
let currentSort = "newest";

const previousPageButton = document.querySelector("#previousPageButton");
const nextPageButton = document.querySelector("#nextPageButton");
const pageInfo = document.querySelector("#pageInfo");

async function loadContacts() {
  const response = await fetch("/api/admin/contacts");

  if (response.status === 401) {
    window.location.href = "/admin/login.html";
    return;
  }

  const contacts = await response.json();
  allContacts = contacts;

  if (currentSort === "oldest") {
    contacts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  if (currentSort === "name") {
    contacts.sort((a, b) => a.name.localeCompare(b.name));
  }

  filteredContacts = contacts;

  if (!response.ok) {
    alert(contacts.message);
    return;
  }

  contactsTable.innerHTML = "";
  const submissionCount = document.querySelector("#submissionCount");

  if (submissionCount) {
    submissionCount.textContent = contacts.length;
  }

  const weeklySubmissions = document.querySelector("#weeklySubmissions");
  const monthlySubmissions = document.querySelector("#monthlySubmissions");

  const now = new Date();

  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();

  const daysFromMonday = day === 0 ? 6 : day - 1;

  startOfWeek.setDate(startOfWeek.getDate() - daysFromMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const weeklyCount = contacts.filter((contact) => {
    return new Date(contact.created_at) >= startOfWeek;
  }).length;

  const monthlyCount = contacts.filter((contact) => {
    return new Date(contact.created_at) >= startOfMonth;
  }).length;

  if (weeklySubmissions) {
    weeklySubmissions.textContent = weeklyCount;
  }

  if (monthlySubmissions) {
    monthlySubmissions.textContent = monthlyCount;
  }

  const latestSubmission = document.querySelector("#latestSubmission");

  if (latestSubmission && contacts.length > 0) {
    latestSubmission.textContent = new Date(
      contacts[0].created_at,
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;

  const pageContacts = filteredContacts.slice(startIndex, endIndex);

  pageContacts.forEach((contact) => {
    const row = document.createElement("tr");

    row.classList.add("contact-row");

    row.addEventListener("click", function (event) {
      if (event.target.closest(".see-more-button")) {
        return;
      }

      const totalPages = Math.max(
        1,
        Math.ceil(filteredContacts.length / contactsPerPage),
      );

      if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      }

      if (previousPageButton) {
        previousPageButton.disabled = currentPage === 1;
      }

      if (nextPageButton) {
        nextPageButton.disabled = currentPage === totalPages;
      }

      const submissionModal = document.querySelector("#submissionModal");

      document.querySelector("#detailName").textContent = contact.name;
      document.querySelector("#detailEmail").textContent = contact.email;
      document.querySelector("#detailPhone").textContent = contact.phone;
      document.querySelector("#detailMessage").textContent = contact.message;

      const emailContactButton = document.querySelector("#emailContactButton");
      const callContactButton = document.querySelector("#callContactButton");
      const whatsappContactButton = document.querySelector(
        "#whatsappContactButton",
      );

      if (emailContactButton) {
        emailContactButton.href = `mailto:${contact.email}`;
      }

      if (callContactButton) {
        callContactButton.href = `tel:${contact.phone}`;
      }

      if (whatsappContactButton) {
        const whatsappNumber = contact.phone.replace(/\D/g, "");
        whatsappContactButton.href = `https://wa.me/${whatsappNumber}`;
      }

      const detailDate = new Date(contact.created_at);

      document.querySelector("#detailDate").textContent =
        detailDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        " at " +
        detailDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

      submissionModal.dataset.contactId = contact.id;

      submissionModal.classList.add("open");
    });

    row.innerHTML = `
            <td>${contact.id}</td>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.phone}</td>
            <td class="message-cell">
            <span class="message-preview">${contact.message}</span>
            <button class="see-more-button" type="button">See more</button>
            </td>
            <td>
            ${new Date(contact.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
                <br>
                ${new Date(contact.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
            </td>
        `;

    contactsTable.appendChild(row);

    const seeMoreButton = row.querySelector(".see-more-button");
    const messagePreview = row.querySelector(".message-preview");

    if (contact.message.length <= 120) {
      seeMoreButton.style.display = "none";
    }

    seeMoreButton.addEventListener("click", function () {
      messagePreview.classList.toggle("expanded");

      if (messagePreview.classList.contains("expanded")) {
        seeMoreButton.textContent = "See less";
      } else {
        seeMoreButton.textContent = "See more";
      }
    });
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredContacts.length / contactsPerPage),
  );

  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  if (previousPageButton) {
    previousPageButton.disabled = currentPage === 1;
  }

  if (nextPageButton) {
    nextPageButton.disabled = currentPage === totalPages;
  }
}

const logoutButton = document.querySelector("#logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async function () {
    const response = await fetch("/api/admin/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        csrfToken,
      }),
    });

    if (response.ok) {
      localStorage.removeItem("csrfToken");
      window.location.href = "/admin/login.html";
    }
  });
}

// ==============================
// CONTACT SEARCH
// ==============================

const searchContacts = document.querySelector("#searchContacts");

if (searchContacts) {
  searchContacts.addEventListener("input", function () {
    const searchTerm = searchContacts.value.toLowerCase().trim();

    const rows = contactsTable.querySelectorAll("tr");

    rows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();

      if (rowText.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
}

// ==============================
// CONTACT SORTING
// ==============================

const sortContacts = document.querySelector("#sortContacts");

if (sortContacts) {
  sortContacts.addEventListener("change", function () {
    currentSort = sortContacts.value;

    currentPage = 1;
    loadContacts();
  });
}

// ==============================
// SUBMISSION DETAILS MODAL
// ==============================

const submissionModal = document.querySelector("#submissionModal");
const closeSubmissionModal = document.querySelector("#closeSubmissionModal");

if (closeSubmissionModal && submissionModal) {
  closeSubmissionModal.addEventListener("click", function () {
    submissionModal.classList.remove("open");
  });
}

if (submissionModal) {
  submissionModal.addEventListener("click", function (event) {
    if (event.target === submissionModal) {
      submissionModal.classList.remove("open");
    }
  });
}

// ==============================
// DELETE SUBMISSION
// ==============================

const deleteSubmissionButton = document.querySelector(
  "#deleteSubmissionButton",
);

const deleteConfirmModal = document.querySelector("#deleteConfirmModal");
const cancelDeleteButton = document.querySelector("#cancelDeleteButton");
const confirmDeleteButton = document.querySelector("#confirmDeleteButton");

if (
  deleteSubmissionButton &&
  submissionModal &&
  deleteConfirmModal &&
  cancelDeleteButton &&
  confirmDeleteButton
) {
  deleteSubmissionButton.addEventListener("click", function () {
    const contactId = submissionModal.dataset.contactId;

    if (!contactId) {
      return;
    }

    deleteConfirmModal.classList.add("open");
  });

  cancelDeleteButton.addEventListener("click", function () {
    deleteConfirmModal.classList.remove("open");
  });

  confirmDeleteButton.addEventListener("click", async function () {
    const contactId = submissionModal.dataset.contactId;

    if (!contactId) {
      deleteConfirmModal.classList.remove("open");
      return;
    }

    confirmDeleteButton.disabled = true;
    confirmDeleteButton.textContent = "Deleting...";

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        deleteConfirmModal.classList.remove("open");
        alert(result.message);
        return;
      }

      deleteConfirmModal.classList.remove("open");
      submissionModal.classList.remove("open");

      await loadContacts();

      if (searchContacts && searchContacts.value.trim() !== "") {
        searchContacts.dispatchEvent(new Event("input"));
      }
    } catch (error) {
      console.error("Failed to delete submission:", error);

      deleteConfirmModal.classList.remove("open");

      alert("Something went wrong. Please try again.");
    } finally {
      confirmDeleteButton.disabled = false;
      confirmDeleteButton.textContent = "Delete";
    }
  });
}

// ==============================
// EXPORT CONTACTS
// ==============================

const exportContactsButton = document.querySelector("#exportContactsButton");

if (exportContactsButton) {
  exportContactsButton.addEventListener("click", function () {
    if (allContacts.length === 0) {
      alert("There are no submissions to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Message", "Date"];

    const rows = allContacts.map((contact) => [
      contact.id,
      contact.name,
      contact.email,
      contact.phone,
      contact.message,
      new Date(contact.created_at).toLocaleString("en-GB"),
    ]);

    const csvRows = [headers, ...rows];

    const csvContent = csvRows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "portfolio-contact-submissions.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  });
}

// ==============================
// REFRESH CONTACTS
// ==============================

const refreshContactsButton = document.querySelector("#refreshContactsButton");

if (refreshContactsButton) {
  refreshContactsButton.addEventListener("click", async function () {
    refreshContactsButton.textContent = "Refreshing...";

    await loadContacts();

    refreshContactsButton.textContent = "Refresh";

    if (searchContacts && searchContacts.value.trim() !== "") {
      searchContacts.dispatchEvent(new Event("input"));
    }
  });
}

// ==============================
// AUTOMATIC REFRESH
// ==============================

if (contactsTable) {
  setInterval(async function () {
    await loadContacts();

    if (searchContacts && searchContacts.value.trim() !== "") {
      searchContacts.dispatchEvent(new Event("input"));
    }
  }, 30000);
}

if (previousPageButton) {
  previousPageButton.addEventListener("click", async function () {
    if (currentPage > 1) {
      currentPage--;
      await loadContacts();
    }
  });
}

if (nextPageButton) {
  nextPageButton.addEventListener("click", function () {
    const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

    if (currentPage < totalPages) {
      currentPage++;
      loadContacts();
    }
  });
}
