/* Scale actual local HTML frames, not screenshot placeholders. */
const frames = [...document.querySelectorAll('.preview')];
document.querySelector('.view-controls').disabled = false;
function fitFrames() {
  const width = Number(document.querySelector('input[name="viewport"]:checked').value);
  frames.forEach((frame) => {
    const scale = Math.min(1, frame.clientWidth / width);
    const iframe = frame.querySelector('iframe');
    iframe.style.width = `${width}px`;
    iframe.style.height = `${Math.round(760 / scale)}px`;
    iframe.style.transform = `scale(${scale})`;
    frame.style.height = '760px';
  });
}
document.querySelectorAll('input[name="viewport"]').forEach((input) => input.addEventListener('change', fitFrames));
window.addEventListener('resize', fitFrames);
fitFrames();
