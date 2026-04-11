const bike = document.querySelector(".bike");

bike.addEventListener("mouseover", () => {
  bike.style.transform = "rotateY(180deg)";
});

bike.addEventListener("mouseout", () => {
  bike.style.transform = "rotateY(0deg)";
});