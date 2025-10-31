let baseAliments = [
  { nom: "Pomme", points: 0 },
  { nom: "Banane", points: 1 },
  { nom: "Pain", points: 3 }
];

const pointsJour = 23;
let reserveTotale = 21;
let reserveRestante = reserveTotale;
let totalConsomme = 0;

// Chargement depuis localStorage
const sauvegarde = localStorage.getItem('baseAliments');
if (sauvegarde) {
  baseAliments = JSON.parse(sauvegarde);
}

function mettreAJourListeDeroulante() {
  const datalist = document.getElementById('liste-aliments');
  datalist.innerHTML = '';
  baseAliments.forEach(aliment => {
    const option = document.createElement('option');
    option.value = aliment.nom;
    datalist.appendChild(option);
  });
}

function mettreAJourListeSuppression() {
  const datalist = document.getElementById('liste-suppression');
  datalist.innerHTML = '';
  baseAliments.forEach(aliment => {
    const option = document.createElement('option');
    option.value = aliment.nom;
    datalist.appendChild(option);
  });
}

const nomInput = document.getElementById('nom');
const pointsInput = document.getElementById('points');
nomInput.addEventListener('input', () => {
  const nom = nomInput.value.trim().toLowerCase();
  const aliment = baseAliments.find(a => a.nom.toLowerCase() === nom);
  pointsInput.value = aliment ? aliment.points : '';
});

function mettreAJourAffichage() {
  document.getElementById('total-points').textContent = totalConsomme.toFixed(1);
  document.getElementById('barre-objectif').value = Math.min(totalConsomme, pointsJour);
  document.getElementById('reserve-restante').textContent = reserveRestante;

  const alerte = document.getElementById('alerte-reserve');
  if (reserveRestante <= 0 && totalConsomme > pointsJour) {
    alerte.textContent = "⚠️ Réserve épuisée !";
  } else {
    alerte.textContent = "";
  }
}

document.getElementById('form-aliment').addEventListener('submit', e => {
  e.preventDefault();
  const nom = nomInput.value.trim();
  const points = parseFloat(pointsInput.value);
  if (!nom || isNaN(points)) return;

  const li = document.createElement('li');
  li.textContent = `${nom} - ${points} pts`;

  const btn = document.createElement('button');
  btn.textContent = '🗑️';
  btn.style.marginLeft = '10px';
  btn.addEventListener('click', () => {
    totalConsomme -= points;

    const surplus = totalConsomme - pointsJour;
    if (surplus < 0) {
      const pointsRestituables = Math.min(points, reserveTotale - reserveRestante);
      reserveRestante += pointsRestituables;
    }

    li.remove();
    mettreAJourAffichage();
  });

  li.appendChild(btn);
  document.getElementById('liste-aliments-jour').appendChild(li);

  totalConsomme += points;

  const surplus = totalConsomme - pointsJour;
  if (surplus > 0) {
    const aRetirer = Math.min(surplus, reserveRestante);
    reserveRestante -= aRetirer;
  }

  mettreAJourAffichage();

  nomInput.value = '';
  pointsInput.value = '';
});

document.getElementById('form-ajout-aliment').addEventListener('submit', e => {
  e.preventDefault();
  const nom = document.getElementById('nouvel-aliment').value.trim();
  const points = parseFloat(document.getElementById('nouveaux-points').value);
  if (!nom || isNaN(points)) return;

  const existant = baseAliments.find(a => a.nom.toLowerCase() === nom.toLowerCase());
  if (existant) {
    existant.points = points;
  } else {
    baseAliments.push({ nom, points });
  }

  localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
  mettreAJourListeDeroulante();
  mettreAJourListeSuppression();

  document.getElementById('form-ajout-aliment').reset();
});

document.getElementById('form-suppression').addEventListener('submit', e => {
  e.preventDefault();
  const nom = document.getElementById('aliment-a-supprimer').value.trim().toLowerCase();
  const index = baseAliments.findIndex(a => a.nom.toLowerCase() === nom);

  if (index !== -1) {
    if (confirm(`Supprimer "${baseAliments[index].nom}" ?`)) {
      baseAliments.splice(index, 1);
      localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
      mettreAJourListeDeroulante();
      mettreAJourListeSuppression();
      document.getElementById('form-suppression').reset();
    }
  } else {
    alert("Aliment non trouvé.");
  }
});

document.getElementById('reset-journee').addEventListener('click', () => {
  totalConsomme = 0;
  reserveRestante = reserveTotale;
  document.getElementById('liste-aliments-jour').innerHTML = '';
  mettreAJourAffichage();
});

mettreAJourListeDeroulante();
mettreAJourListeSuppression();
mettreAJourAffichage();
