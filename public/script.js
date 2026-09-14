const form = document.querySelector("#contact form");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const formData = {
    name: document.querySelector("#name").value,
    email: document.querySelector("#email").value,
    phone: document.querySelector("#phone").value,
    message: document.querySelector("#message").value,
  };

  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const result = await response.json();

  const formMessage = document.querySelector("#formMessage");

  formMessage.textContent = result.message;

  if (response.ok) {
    form.reset();
  }
});

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.15,
  },
);

sections.forEach((section) => {
  observer.observe(section);
});