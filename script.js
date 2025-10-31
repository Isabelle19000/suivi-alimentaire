// Sélection des éléments HTML
const form = document.getElementById('form-aliment');
const liste = document.getElementById('liste-aliments-jour');
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
  { nom: "Pomme", points: 0, favori: true },
  { nom: "Banane", points: 0, favori: false },
  { nom: "Pain", points: 3, favori: true }
];

const sauvegarde = localStorage.getItem('baseAliments');
if (sauvegarde) {
  const parsed = JSON.parse(sauvegarde);
  if (Array.isArray(parsed) && parsed.length > 0) {
    baseAliments = parsed;
  }
}

mettreAJourListeDeroulante(); // ← met à jour la datalist

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


// Auto-remplir les points quand on tape ou sélectionne un aliment
const nomInput = document.getElementById('nom');
const pointsInput = document.getElementById('points');

nomInput.addEventListener('input', () => {
  const nom = nomInput.value.trim().toLowerCase();
  const aliment = baseAliments.find(a => a.nom.toLowerCase().startsWith(nom));
  if (aliment) {
    pointsInput.value = aliment.points;
  } else {
    pointsInput.value = '';
  }
});






// Enregistrement du service worker pour installation mobile (PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker enregistré'))
    .catch(err => console.error('Erreur SW:', err));
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
afficherBaseAliments();


// Ajout d’un aliment à la journée
form.addEventListener('submit', function(e) {
  e.preventDefault();

  const nom = nomSelect.value.trim();
  const aliment = baseAliments.find(a => a.nom.toLowerCase() === nom.toLowerCase());
  let points = parseFloat(pointsInput.value);

  // Si l'utilisateur n'a pas saisi de points, on prend ceux de la base
  if (isNaN(points) && aliment) {
    points = aliment.points;
  }

  // Si toujours invalide, on bloque
  if (!nom || isNaN(points)) {
    alert("Merci de choisir un aliment valide et de renseigner les points.");
    return;
  }

  // ... (le reste de ton code pour ajouter à la liste, mettre à jour le total, etc.)
});


  // 📅 Date du jour pour l’historique
  const date = new Date().toLocaleDateString('fr-FR');

  // ✅ Vérification que les données sont valides
  if (nom && !isNaN(points)) {

    // 📝 Création de l’élément à afficher dans la liste
    const li = document.createElement('li');
    li.textContent = `${nom} - ${points} points`;

    // ❌ Bouton de suppression
    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = 'Supprimer';
    btnSupprimer.className = 'btn-supprimer';

    // 🗑️ Gestion de la suppression
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

    // ➕ Ajout à la liste visible
    li.appendChild(btnSupprimer);
    liste.appendChild(li);

    // 🔢 Mise à jour du total
    total += points;
    totalPoints.textContent = total;
    document.getElementById('barre-objectif').value = total;

    // 🗃️ Ajout à l’historique
    if (!historique[date]) {
      historique[date] = [];
    }
    historique[date].push({ nom, points });

    // 💾 Sauvegarde et mise à jour de l’affichage
    afficherHistorique();
    localStorage.setItem('historique', JSON.stringify(historique));
    localStorage.setItem('totalPoints', total);

    // 🔄 Réinitialisation du formulaire
    form.reset();
  } else {
    alert("Merci de choisir un aliment valide et de renseigner les points.");
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
  console.log("BaseAliments :", baseAliments);

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
	 afficherCalendrier();
}

// Afficher calendrier
function afficherCalendrier() {
  const calendrier = document.getElementById('calendrier');
  calendrier.innerHTML = '';

  const dates = Object.keys(historique);
  dates.forEach(date => {
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
  const datalist = document.getElementById('liste-aliments');
  datalist.innerHTML = '';

  baseAliments.forEach(aliment => {
    const option = document.createElement('option');
    option.value = aliment.nom;
    datalist.appendChild(option);
  });
}

  console.log("Datalist mise à jour :", baseAliments);
		  
  // 🧠 Tri : favoris d’abord, puis ordre alphabétique
  const alimentsTries = [...baseAliments]
    .sort((a, b) => {
      if (a.favori && !b.favori) return -1;
      if (!a.favori && b.favori) return 1;
      return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
    });

  // 📝 Remplissage du datalist
  alimentsTries.forEach(aliment => {
    const option = document.createElement('option');
    option.value = aliment.nom;
    datalist.appendChild(option);
  });

  suggereAliments();
}
// ⭐ Affiche la base d'aliments avec étoiles cliquables
function afficherBaseAliments() {
  const ul = document.getElementById('liste-base-aliments');
  ul.innerHTML = '';

  const alimentsTries = [...baseAliments].sort((a, b) => {
    if (a.favori && !b.favori) return -1;
    if (!a.favori && b.favori) return 1;
    return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
  });

  alimentsTries.forEach((aliment, index) => {
    const li = document.createElement('li');
    li.textContent = `${aliment.nom} - ${aliment.points} pts `;

    // ⭐ Étoile favori
    const etoile = document.createElement('span');
    etoile.textContent = aliment.favori ? '⭐' : '☆';
    etoile.style.cursor = 'pointer';
    etoile.style.marginLeft = '10px';
    etoile.addEventListener('click', () => {
      basculerFavori(aliment.nom);
      afficherBaseAliments();
    });

    // 🗑️ Bouton supprimer
    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = '🗑️';
    btnSupprimer.style.marginLeft = '10px';
    btnSupprimer.addEventListener('click', () => {
      if (confirm(`Supprimer "${aliment.nom}" de la base ?`)) {
        baseAliments.splice(index, 1);
        localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
        mettreAJourListeDeroulante();
        afficherBaseAliments();
      }
    });

    li.appendChild(etoile);
    li.appendChild(btnSupprimer);
    ul.appendChild(li);
  });
}

// ⭐ Basculer un aliment en favori
function basculerFavori(nom) {
  const aliment = baseAliments.find(a => a.nom === nom);
  if (aliment) {
    aliment.favori = !aliment.favori;
    localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
    mettreAJourListeDeroulante();
  }
}

// Suggere des aliment à 0 pts
function suggereAliments() {
  const suggestions = baseAliments.filter(a => a.points === 0);
  if (suggestions.length > 0) {
    alert("Suggestions à 0 point :\n" + suggestions.map(a => a.nom).join('\n'));
  }
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
// ✅ Ajout d’un aliment à la base
formAjout.addEventListener('submit', function(e) {
  e.preventDefault();
  const nom = nouvelAliment.value.trim();
  const points = parseFloat(nouveauxPoints.value);

  if (nom && !isNaN(points)) {
    const alimentExistant = baseAliments.find(
      a => a.nom.toLowerCase() === nom.toLowerCase()
    );

    if (alimentExistant) {
      // Met à jour les points si l’aliment existe déjà
      alimentExistant.points = points;
      alert(`L'aliment "${nom}" a été mis à jour.`);
    } else {
      // Ajoute un nouvel aliment
      baseAliments.push({ nom, points, favori: false });
      alert(`L'aliment "${nom}" a été ajouté.`);
    }

    localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
    mettreAJourListeDeroulante();
    afficherBaseAliments();
    formAjout.reset();
  } else {
    alert("Merci de saisir un nom et des points valides.");
  }
});

// ✅ Modification d’un aliment via formulaire dédié
formModif.addEventListener('submit', function(e) {
  e.preventDefault();
  const nom = modifNom.value.trim();
  const points = parseFloat(modifPoints.value);

  const aliment = baseAliments.find(a => a.nom.toLowerCase() === nom.toLowerCase());
  if (aliment && !isNaN(points)) {
    aliment.points = points;
    localStorage.setItem('baseAliments', JSON.stringify(baseAliments));
    mettreAJourListeDeroulante();
    afficherBaseAliments();
    alert(`Aliment "${nom}" mis à jour avec ${points} points.`);
    formModif.reset();
  } else {
    alert("Aliment introuvable ou points invalides.");
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

nomSelect.addEventListener('change', () => {
  const nom = nomSelect.value.trim();
  const aliment = baseAliments.find(a => a.nom.toLowerCase() === nom.toLowerCase());
  if (aliment) {
    pointsInput.value = aliment.points;
  } else {
    pointsInput.value = '';
  }
});

window.addEventListener('load', () => {
  const chargement = document.getElementById('chargement');
  if (chargement) chargement.style.display = 'none';
});





