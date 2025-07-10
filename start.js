const track = document.querySelector('.carousel-track');
let index = 0;

function nextSlide() {
  index++;
  if (index >= track.children.length) index = 0;
  track.style.transform = `translateX(-${index * 100}%)`;
}

setInterval(nextSlide, 3000);
