'use strict';

/**
 * UI Controller
 *
 * Handles three concerns:
 *  - Sidebar expand/collapse (mobile "Show Contacts" toggle)
 *  - Navbar tab navigation (switches active [data-page] article)
 *  - Contact form validation (enables submit button when all fields are filled)
 *
 * Also exports initFiltering() which wires up the project category filter
 * (both desktop tabs and mobile dropdown).
 */

export const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

export const initUI = () => {
  // --- Sidebar toggle (mobile) ---
  const sidebar = document.querySelector("[data-sidebar]");
  const sidebarBtn = document.querySelector("[data-sidebar-btn]");

  if (sidebarBtn) {
    sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });
  }

  // --- Navbar page switching ---
  // Matches the button text (lowercased) to the data-page attribute on articles
  const navigationLinks = document.querySelectorAll("[data-nav-link]");
  const pages = document.querySelectorAll("[data-page]");

  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].addEventListener("click", function () {
      const targetPage = this.innerHTML.toLowerCase().trim();

      for (let j = 0; j < pages.length; j++) {
        if (targetPage === pages[j].dataset.page) {
          pages[j].classList.add("active");
          navigationLinks[j].classList.add("active");
          window.scrollTo(0, 0);
        } else {
          pages[j].classList.remove("active");
          navigationLinks[j].classList.remove("active");
        }
      }
    });
  }

  // --- Contact form validation ---
  const form = document.querySelector("[data-form]");
  const formInputs = document.querySelectorAll("[data-form-input]");
  const formBtn = document.querySelector("[data-form-btn]");

  if (form) {
    for (let i = 0; i < formInputs.length; i++) {
      formInputs[i].addEventListener("input", function () {
        if (form.checkValidity()) {
          formBtn.removeAttribute("disabled");
        } else {
          formBtn.setAttribute("disabled", "");
        }
      });
    }
  }
};

/**
 * Project Filtering
 *
 * Supports two UIs for the same operation:
 *  - Desktop: clickable filter tabs ([data-filter-btn])
 *  - Mobile: dropdown select ([data-select] / [data-select-item])
 *
 * Each project card has a data-category attribute (pipe-separated for multi-category).
 * Selecting "All" shows everything; otherwise only matching categories are shown.
 */
export const initFiltering = () => {
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-selecct-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");
  const filterItems = document.querySelectorAll("[data-filter-item]");

  const filterFunc = function (selectedValue) {
    selectedValue = selectedValue.toLowerCase().trim();
    for (let i = 0; i < filterItems.length; i++) {
      const itemCategories = filterItems[i].dataset.category.toLowerCase().split('|');

      if (selectedValue === "all" || itemCategories.includes(selectedValue)) {
        filterItems[i].classList.add("active");
      } else {
        filterItems[i].classList.remove("active");
      }
    }
  }

  if (select) {
    select.addEventListener("click", function () { elementToggleFunc(this); });
  }

  // Mobile dropdown items
  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  }

  // Desktop filter tabs
  if (filterBtn.length > 0) {
    let lastClickedBtn = filterBtn[0];
    for (let i = 0; i < filterBtn.length; i++) {
      filterBtn[i].addEventListener("click", function () {
        let selectedValue = this.innerText.toLowerCase();
        if (selectValue) selectValue.innerText = this.innerText;
        filterFunc(selectedValue);
        lastClickedBtn.classList.remove("active");
        this.classList.add("active");
        lastClickedBtn = this;
      });
    }
  }
};
