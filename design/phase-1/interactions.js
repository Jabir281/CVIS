/* Progressive enhancement for local concept controls. No requests or storage. */
document.querySelectorAll('.mobile-menu').forEach((menu) => {
  const summary = menu.querySelector('summary');
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      summary.focus();
    }
  });
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.open = false;
      const fragment = link.hash;
      const target = fragment && document.getElementById(fragment.slice(1));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
});

const sampling = document.getElementById('sampling');
const sampleFigure = document.getElementById('sample-figure');
const samplingValue = document.getElementById('sampling-value');
if (sampling && sampleFigure && samplingValue) {
  sampling.disabled = false;
  document.getElementById('sampling-status').textContent = 'Move the divider with touch, a pointer, or the arrow keys.';
  sampling.addEventListener('input', () => {
    const value = Math.min(100, Math.max(0, Number(sampling.value)));
    sampleFigure.style.setProperty('--split', `${value}%`);
    samplingValue.textContent = `${value}%`;
  });
}
