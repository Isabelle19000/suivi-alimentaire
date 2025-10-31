// 🔗 Sélection des éléments HTML
const form = document.getElementById('form-aliment');
const liste = document.getElementById('liste-aliments');
const totalPoints = document.getElementById('total-points');
const resetButton = document.getElementById('reset');
const historiqueDiv = document.getElementById('historique');
const poidsForm = document.getElementById('form-poids');
const poidsInput = document.getElementById('poids');
const poidsChartCanvas = document.getElementById('poidsChart');
const listePoids = document.getElementById('liste-poids');
const resetAllButton = document.getElementById('reset-all');
const nomSelect = document.getElementById('nom');
const pointsInput = document.getElementById('points');
const formAjout = document.getElementById('form-ajout-aliment');
const nouvelAliment = document.getElementById('nouvel-aliment');
const nouveauxPoints = document.getElementById('nouveaux-points');
const exportBtn = document.getElementById('export-base');
const importInput = document.getElementById('import-base');

// 📦 Données
let total = 0;
let historique = {};
let poidsHistorique = [];
let baseAliments = [
  { nom: "Pomme", points: 0, favori: true },
  { nom: "Banane", points: 0, favori: false },
  { nom: "Pain", points: 3, favori: true }
];

// 💾 Chargement depuis localStorage
if (localStorage.getItem('historique')) {
  historique = JSON.parse(localStorage.getItem('historique'));
  afficherHistorique();
}
if (localStorage.getItem('totalPoints')) {
  total = parseFloat(localStorage.getItem('totalPoints'));
  totalPoints.textContent = total;
}
if (localStorage.getItem('poidsHistorique')) {
  poidsHistorique = JSON.parse(localStorage.getItem('poidsHistorique'));
}
if (localStorage.getItem('baseAliments')) {
  baseAliments = JSON.parse(localStorage.getItem('baseAliments'));
}

// 📊 Initialisation du graphique
let poidsData = {
  labels: [],
  datasets: [{
    label: 'Poids (kg)',
    data: [],
    borderColor: 'blue',
    backgroundColor: 'lightblue',
    fill: false,
    tension: 0.3
  }]
};
let poidsChart = new Chart(poidsChartCanvas, {
  type: 'line',
  data: poidsData,
  options: {
    responsive: true,
    scales: { y: { beginAtZero: false } }
  }
});

// 🧠 Fonctions utilitaires
function mettreAJourListeDeroulante() {
  const datalist = document.getElementById('liste-aliments');
  datalist.innerHTML = '';
  const alimentsTries = [...baseAliments].sort((a, b) =>
    a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
  );
  alimentsTries.forEach(aliment => {
    const option = document.createElement('option');
    option.value = aliment.nom;
    datalist.appendChild(option);
  });
  suggereAliments();
}
function suggereAliments() {
  const suggestions = baseAliments.filter(a => a.points === 0);
  if (suggestions.length > 0) {
    alert("Suggestions à 0 point :\n" + suggestions.map(a => a.nom).join('\n'));
  }
}
function afficherHistorique() {
  historiqueDiv.innerHTML = '';
  for (const date in historique) {
    const section = document.createElement('div');
    section.innerHTML = `<h3>${date}</h3>`;
    const ul = document.createElement('ul');
    historique[date].forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.nom} - ${item.points} points`;
      ul.appendChild(li);
    });
    section.appendChild(ul);
    historiqueDiv.appendChild(section);
  }
  afficherCalendrier();
}
function afficherCalendrier() {
  const calendrier = document.getElementById('calendrier');
  calendrier.innerHTML = '';
  Object.keys(historique).forEach(date => {
    const bouton = document.createElement('button');
    bouton.textContent = date;
    bouton.style.margin = '5px';
    bouton.addEventListener('click', () => {
      const aliments = historique[date]
        .map(a => `${a.nom} - ${a.points} pts`)
        .join('\n');
      alert(`Aliments du ${date} :\n${aliments}`);
    });
    calendrier.appendChild(bouton);
  });
}
function mettreAJourGraphique() {
  poidsData.labels = poidsHistorique.map(item => item.date);
  poidsData.datasets[0].data = poidsHistorique.map(item => item.poids);
  poidsChart.update();
}
function afficherPoidsListe() {
  listePoids.innerHTML = '';
  poidsHistorique.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.date} : ${item.poids} kg`;
    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = 'Supprimer';
    btnSupprimer.className = 'btn-supprimer';
    btnSupprimer.addEventListener('click', () => {
      poidsHistorique.splice(index, 1);
      localStorage.setItem('poidsHistorique', JSON.stringify(poidsHistorique));
      mettreAJourGraphique();
      afficherPoidsListe();
    });
    li.appendChild(btnSupprimer);
    listePoids.appendChild(li);
  });
}
function afficherBaseAliments() {
  const ul = document.getElementById('liste-base-aliments');
  ul.innerHTML = '';
  const alimentsTries = [...baseAliments].sort((a, b) => {
    if (a.favori && !b.favori) return -1;
    if (!a.favori && b.favori) return 1;
    return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
  });
  alimentsTries.forEach(aliment => {
    const li = document.createElement('li');
    li.textContent = `${aliment.nom} - ${aliment.points} pts `;
    const etoile = document.createElement('span');
    etoile.textContent = aliment.favori ? '⭐' : '☆';
    etoile.style.cursor = 'pointer';
    etoile.style.marginLeft = '10px';
    etoile.addEventListener('click', () => {
      basculerFavori(aliment.nom);
      afficherBaseAliments();
    });
    li.appendChild(etoile);
    ul.appendChild(li);
  });
}
function basculerFavori(nom) {
  const aliment = baseAliments.find(a => a.nom === nom);
  if (aliment) {
    aliment.favori = !aliment.favori;
    localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
    mettreAJourListeDeroulante();
  }
}

// 🚀 Initialisation
mettreAJourGraphique();
afficherPoidsListe();
mettreAJourListeDeroulante();
afficherBaseAliments();

// 🧩 Événements
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const nom = nomSelect.value.trim();
  const aliment = baseAliments.find(a => a.nom.toLowerCase() === nom.toLowerCase());
  let points = parseFloat(pointsInput.value);
  if (aliment && isNaN(points)) points = aliment.points;
  const date = new Date().toLocaleDateString('fr-FR');
  if (nom && !isNaN(points)) {
    const li = document.createElement('li');
    li.textContent = `${nom} - ${points} points`;
    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = 'Supprimer';
    btnSupprimer.className = 'btn-supprimer';
    btnSupprimer.addEventListener('click', function() {
      liste.removeChild(li);
      total -= points;
      totalPoints.textContent = total;
      const index = historique[date].findIndex(item => item.nom === nom && item.points === points);
      if (index !== -1) historique[date].splice(index, 1);
      afficherHistorique();
      localStorage.setItem('historique', JSON.stringify(historique));
      localStorage.setItem('totalPoints', total);
    });
    li.appendChild(btnSupprimer);
    liste.appendChild(li);
    total += points;
    totalPoints.textContent = total;
    document.getElementById('barre-objectif').value = total;
    if (!historique[date]) historique[date] = [];
    historique[date].push({ nom, points });
    afficherHistorique();
    localStorage.setItem('historique', JSON.stringify(historique));
    localStorage.setItem('totalPoints', total);
    form.reset();
  } else {
    alert("Merci de choisir un aliment valide et de renseigner les points.");
  }
});
resetButton.addEventListener('click', function() {
  liste.innerHTML = '';
  total = 0;
  totalPoints.textContent
