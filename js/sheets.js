/* Personalize sheet + global keyboard handling. */
import { $, $$, S, app, toast, onSettings, saveSettings, defaults } from './core.js';
import { cinema, closeCinema } from './wish.js';
import { vwOpen, closeViewer } from './viewer.js';

/* ================= sheets ================= */
export let lastFocus = null;
export function openSheet(id, focusEl){ lastFocus = document.activeElement; const s = $(id); s.hidden = false; setTimeout(() => (focusEl || s.querySelector('button, input')).focus({ preventScroll: true }), 60); }
export function closeSheets(){ $$('.sheet').forEach(s => s.hidden = true); if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
$('#editBtn').addEventListener('click', () => { $('#fName').value = S.name; $('#fDate').value = S.date; $('#fFrom').value = S.from; openSheet('#editSheet', $('#fName')); });
$('#editCancel').addEventListener('click', closeSheets);
$('#editForm').addEventListener('submit', e => {
  e.preventDefault();
  saveSettings({ name: $('#fName').value.trim() || defaults.name, date: $('#fDate').value.trim() || defaults.date, from: $('#fFrom').value.trim() || defaults.from });
  closeSheets(); toast('Saved across all timelines.');
});
$$('.sheet').forEach(s => s.addEventListener('click', e => { if (e.target === s) closeSheets(); }));
addEventListener('keydown', e => { if (e.key === 'Escape'){ if (!cinema.hidden) closeCinema(); else if (vwOpen) closeViewer(); else closeSheets(); } });
onSettings.push(() => { if (app.portal) app.portal.redraw(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (app.portal) app.portal.redraw(); });
