// ==============================
// CONTACT FORM
// ==============================

const form = document.querySelector("#contact form");

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const phone = document.querySelector("#phone").value.trim();
    const message = document.querySelector("#message").value.trim();

    const formMessage = document.querySelector("#formMessage");
    const submitButton = form.querySelector('button[type="submit"]');

    if (!name || !email || !phone || !message) {
      formMessage.textContent = "Please fill in all fields.";
      formMessage.className = "form-error";
      return;
    }

    const nameParts = name.split(/\s+/);

    if (nameParts.length < 2) {
      formMessage.textContent = "Please enter your full name.";
      formMessage.className = "form-error";
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailPattern.test(email)) {
      formMessage.textContent = "Please enter a valid email address.";
      formMessage.className = "form-error";
      return;
    }

    const formData = {
      name,
      email,
      phone,
      message,
    };

    // Clear previous message
    formMessage.textContent = "";
    formMessage.className = "";

    // Sending state
    submitButton.disabled = true;
    submitButton.classList.add("sending");

    submitButton.innerHTML = `
            <span class="button-spinner"></span>
            <span>Sending...</span>
        `;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        formMessage.textContent =
          result.message || "Something went wrong. Please try again.";

        formMessage.className = "form-error";

        submitButton.disabled = false;
        submitButton.classList.remove("sending");

        submitButton.textContent = "Send Message";

        return;
      }

      // Success
      form.reset();

      // Keep the sending state visible briefly
      await new Promise(function (resolve) {
        setTimeout(resolve, 700);
      });

      submitButton.classList.remove("sending");
      submitButton.classList.add("sent");

      submitButton.innerHTML = `
    <span>✓</span>
    <span>Sent</span>
`;

      formMessage.textContent =
        "Thanks for reaching out. I’ll get back to you soon.";

      formMessage.className = "form-success";

      // Return button to normal after 5 seconds
      setTimeout(function () {
        submitButton.classList.remove("sent");
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }, 5000);

      // Remove the thank-you message after 10 seconds
      setTimeout(function () {
        formMessage.textContent = "";
        formMessage.className = "";
      }, 10000);
    } catch (error) {
      console.error("Form submission failed:", error);

      formMessage.textContent = "Something went wrong. Please try again.";

      formMessage.className = "form-error";

      submitButton.disabled = false;
      submitButton.classList.remove("sending");

      submitButton.textContent = "Send Message";
    }
  });
}

// ==============================
// CONTACT SIDE PANEL
// ==============================

const contactPanel = document.querySelector("#contact");
const returnButton = document.querySelector("#returnButton");
const navContact = document.querySelector("#navContact");
if (navContact && contactPanel) {
  navContact.addEventListener("click", function (event) {
    event.preventDefault();

    const formMessage = document.querySelector("#formMessage");

    if (formMessage) {
      formMessage.textContent = "";
    }

    contactPanel.classList.add("open");
  });
}

// Open contact panel
const workButtons = document.querySelectorAll("#hero a");

workButtons.forEach((button) => {
  button.addEventListener("click", function (event) {
    event.preventDefault();

    if (contactPanel) {
      contactPanel.classList.add("open");
    }
  });
});

// Return to main page
if (returnButton && contactPanel) {
  returnButton.addEventListener("click", function (event) {
    event.preventDefault();

    contactPanel.classList.remove("open", "show");
  });
}

// ==============================
// SCROLL ANIMATION
// ==============================

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

const floatingWorkButton = document.querySelector("#floatingWorkButton");

if (floatingWorkButton && contactPanel) {
  floatingWorkButton.addEventListener("click", function () {
    contactPanel.classList.add("open");
  });
}

// =========================
// PROJECTS COVER FLOW
// =========================

const projectCards = document.querySelectorAll("#projects .project-card");

const projectDetails = document.querySelector("#projects .project-details");
const projectDetailsNumber = projectDetails.querySelector(".project-details-number");
const projectDetailsTitle = projectDetails.querySelector("h3");
const projectDetailsDescription = projectDetails.querySelector("p");
const projectDetailsTechnologies = projectDetails.querySelector(".project-technologies");

const projectData = [
  {
    number: "01",
    title: "Business Portfolio Website",
    description:
      "A professional website designed to present a business, its services, and previous work.",
    technologies: ["HTML", "CSS", "JavaScript"],
  },
  {
    number: "02",
    title: "Service Request System",
    description:
      "A full-stack system that collects customer requests and lets an administrator manage them from a private dashboard.",
    technologies: ["HTML", "CSS", "JavaScript", "Node.js", "PostgreSQL"],
  },
  {
    number: "03",
    title: "E-Commerce Platform",
    description:
      "An online shopping system with products, customer orders, and an administrative management area.",
    technologies: ["HTML", "CSS", "JavaScript", "Node.js", "PostgreSQL"],
  },
  {
    number: "04",
    title: "School Management System",
    description:
      "A system for managing students, courses, records, and administrative activities.",
    technologies: ["HTML", "CSS", "JavaScript", "Node.js", "PostgreSQL"],
  }
];

let activeProject = 1;

function updateProjectCarousel() {
  projectCards.forEach((card, index) => {
    card.removeAttribute("data-position");

    const previous =
      (activeProject - 1 + projectCards.length) % projectCards.length;

    const next = (activeProject + 1) % projectCards.length;

    if (index === activeProject) {
      card.setAttribute("data-position", "center");
    } else if (index === previous) {
      card.setAttribute("data-position", "left");
    } else if (index === next) {
      card.setAttribute("data-position", "right");
    } else {
      card.setAttribute("data-position", "hidden");
    }
  });

  const project = projectData[activeProject];

  projectDetailsNumber.textContent = project.number;
  projectDetailsTitle.textContent = project.title;
  projectDetailsDescription.textContent = project.description;

  projectDetailsTechnologies.innerHTML = "";

  project.technologies.forEach((technology) => {
    const technologyElement = document.createElement("span");
    technologyElement.textContent = technology;
    projectDetailsTechnologies.appendChild(technologyElement);
  });
}


projectCards.forEach((card, index) => {

    card.addEventListener("click", () => {

        activeProject = index;

        updateProjectCarousel();

    });

});


updateProjectCarousel();

