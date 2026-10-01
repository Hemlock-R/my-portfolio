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
const projectDetailsLink = projectDetails.querySelector("a");

const projectData = [
  {
    number: "01",
    title: "CediFlow",
    description:
      "A financial health and wealth tracking application designed to help users monitor their finances, goals, transactions, and overall financial progress.",
    technologies: ["HTML5", "CSS3", "JavaScript", "LocalStorage", "PWA"],
    link: "https://cediflow-finance-tracker.onrender.com"
  },

  {
    number: "02",
    title: "Celebra",
    description:
      "A birthday and relationship manager designed to help users keep track of birthdays, important dates, relationships, and celebrations.",
    technologies: ["HTML5", "CSS3", "JavaScript", "LocalStorage"],
    link: "https://celebra-birthday-manager.onrender.com"
  },

  {
    number: "03",
    title: "Coming Soon",
    description: "A new project is currently being developed.",
    technologies: [],
    link: "#"
  },

  {
    number: "04",
    title: "Coming Soon",
    description: "A new project is currently being developed.",
    technologies: [],
    link: "#"
  },
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

  projectDetailsLink.href = project.link;

  if (project.link === "#") {
    projectDetailsLink.removeAttribute("target");
  } else {
    projectDetailsLink.target = "_blank";
    projectDetailsLink.rel = "noopener";
  }
}


projectCards.forEach((card, index) => {

    card.addEventListener("click", () => {

        activeProject = index;

        updateProjectCarousel();

    });

});


updateProjectCarousel();

