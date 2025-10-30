// Sélection des éléments HTML
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

// Données
let total = 0;
let historique = {};
let poidsHistorique = [];
let baseAliments = [
  { nom: "Pomme", points: 0 },
  { nom: "Banane", points: 2 },
  { nom: "Pain complet", points: 3 }
];

// Chargement des données depuis localStorage
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

// Initialisation du graphique
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
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
});

mettreAJourGraphique();
afficherPoidsListe();
mettreAJourListeDeroulante();
// Ajout d’un aliment à la journée
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nom = nomSelect.value;
  const points = parseFloat(pointsInput.value);
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
      if (index !== -1) {
        historique[date].splice(index, 1);
      }

      afficherHistorique();
      localStorage.setItem('historique', JSON.stringify(historique));
      localStorage.setItem('totalPoints', total);
    });

    li.appendChild(btnSupprimer);
    liste.appendChild(li);

    total += points;
    totalPoints.textContent = total;

    if (!historique[date]) {
      historique[date] = [];
    }
    historique[date].push({ nom, points });

    afficherHistorique();
    localStorage.setItem('historique', JSON.stringify(historique));
    localStorage.setItem('totalPoints', total);
    form.reset();
  }
});

// Réinitialisation de la journée
resetButton.addEventListener('click', function() {
  liste.innerHTML = '';
  total = 0;
  totalPoints.textContent = total;
  historique = {};
  afficherHistorique();
  localStorage.removeItem('historique');
  localStorage.removeItem('totalPoints');
});

// Réinitialisation complète
resetAllButton.addEventListener('click', function () {
  const confirmation = confirm("⚠️ Cette action va effacer toutes les données. Continuer ?");
  if (!confirmation) return;

  liste.innerHTML = '';
  total = 0;
  totalPoints.textContent = total;
  historique = {};
  afficherHistorique();

  poidsHistorique = [];
  mettreAJourGraphique();
  afficherPoidsListe();

  baseAliments = [
    { nom: "Pomme", points: 0 },
    { nom: "Banane", points: 2 },
    { nom: "Pain complet", points: 3 }
  ];
  mettreAJourListeDeroulante();

  localStorage.clear();
});

// Historique alimentaire
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
}
// Ajout d’un poids
poidsForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const poids = parseFloat(poidsInput.value);
  const date = new Date().toLocaleDateString('fr-FR');

  if (!isNaN(poids)) {
    poidsHistorique.push({ date, poids });
    localStorage.setItem('poidsHistorique', JSON.stringify(poidsHistorique));
    mettreAJourGraphique();
    afficherPoidsListe();
    poidsForm.reset();
  }
});

// Mise à jour du graphique
function mettreAJourGraphique() {
  poidsData.labels = poidsHistorique.map(item => item.date);
  poidsData.datasets[0].data = poidsHistorique.map(item => item.poids);
  poidsChart.update();
}

// Liste des poids
function afficherPoidsListe() {
  listePoids.innerHTML = '';
  poidsHistorique.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.date} : ${item.poids} kg`;

    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = 'Supprimer';
    btnSupprimer.className = 'btn-supprimer';

    btnSupprimer.addEventListener('click', function () {
      poidsHistorique.splice(index, 1);
      localStorage.setItem('poidsHistorique', JSON.stringify(poidsHistorique));
      mettreAJourGraphique();
      afficherPoidsListe();
    });

    li.appendChild(btnSupprimer);
    listePoids.appendChild(li);
  });
}

// Liste déroulante des aliments
function mettreAJourListeDeroulante() {
  nomSelect.innerHTML = '<option value="">-- Choisir un aliment --</option>';
  baseAliments.forEach(aliment => {
    const option = document.createElement('option');
    option.value = aliment.nom;
    option.textContent = aliment.nom;
    nomSelect.appendChild(option);
  });
}

// Auto-remplissage des points
nomSelect.addEventListener('change', function () {
  const alimentChoisi = baseAliments.find(item => item.nom === nomSelect.value);
  if (alimentChoisi) {
    pointsInput.value = alimentChoisi.points;
  } else {
    pointsInput.value = '';
  }
});

// Ajout d’un aliment à la base
formAjout.addEventListener('submit', function(e) {
  e.preventDefault();
  const nom = nouvelAliment.value.trim();
  const points = parseFloat(nouveauxPoints.value);

  if (nom && !isNaN(points)) {
    baseAliments.push({ nom, points });
    localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
    mettreAJourListeDeroulante();
    formAjout.reset();
  }
});

// Exporter la base
exportBtn.addEventListener('click', function () {
  const dataStr = JSON.stringify(baseAliments, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "base-aliments.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Importer la base
importInput.addEventListener('change', function () {
  const file = importInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        baseAliments = importedData;
        localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
        mettreAJourListeDeroulante();
        alert("✅ Base importée avec succès !");
      } else {
        alert("❌ Format de fichier invalide.");
      }
    } catch (err) {
      alert("❌ Erreur lors de l'importation : " + err.message);
    }
  };
  reader.readAsText(file);
});
