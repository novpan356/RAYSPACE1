import {createScoreboard} from './scoreboard.js';
const view=await createScoreboard(document.querySelector('#overlay'));await document.fonts.ready;
const events=new EventSource('/events');events.onmessage=e=>view.draw(JSON.parse(e.data));
// Keep last score through brief reconnection; never add a status banner to the broadcast.
