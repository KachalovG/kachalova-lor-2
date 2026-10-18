"use strict";

// Content and clinic links remain available without JavaScript.
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const setMenu = (open) => {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  navigation.classList.toggle("is-open", open);
};
menuToggle.hidden = false;
document.documentElement.classList.add("js");
menuToggle.addEventListener("click", () =>
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true"),
);
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".header")) setMenu(false);
});
matchMedia("(min-width: 1001px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

const booking = document.querySelector("#booking");
if (typeof booking.showModal === "function") {
  let opener;
  document.querySelectorAll("[data-book]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      opener = link;
      setMenu(false);
      booking.showModal();
      document.body.classList.add("dialog-open");
    });
  });
  booking
    .querySelector(".dialog-close")
    .addEventListener("click", () => booking.close());
  booking.addEventListener("click", (event) => {
    if (event.target !== booking) return;
    const box = booking.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      booking.close();
  });
  booking.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    opener?.focus({ preventScroll: true });
  });
}
