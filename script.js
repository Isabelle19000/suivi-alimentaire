// Base d'aliments
let baseAliments = [
  { nom: "Pomme", points: 0 },
  { nom: "Banane", points: 1 },
  { nom: "Pain", points: 3 }
];

// Ciblage des éléments
const form = document.getElementById('form-aliment');
const nomInput = document.getElementById('nom');
const pointsInput = document.getElementById('points');
const listeJour = document.getElementById('liste-jour');

// Remplir la datalist
function mettreAJourListeDeroulante() {
  const datalist = document.getElementById('liste-aliments');
  datalist.innerHTML = '';
  baseAliments.forEach(aliment => {
    const option = document.createElement('option');
    option.value = aliment.nom;
    datalist.appendChild(option);
  });
}

// Auto-remplir les points quand on sélectionne un aliment
nomInput.addEventListener('change', () => {
  const nom = nomInput.value.trim();
  const aliment = baseAliments.find(a => a.nom.toLowerCase() === nom.toLowerCase());
  if (aliment) {
    pointsInput.value = aliment.points;
  } else {
    pointsInput.value = '';
  }
});

// Ajouter un aliment à la journée
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const nom = nomInput.value.trim();
  let points = parseFloat(pointsInput.value);

  const aliment = baseAliments.find(a => a.nom.toLowerCase() === nom.toLowerCase());
  if (isNaN(points) && aliment) {
    points = aliment.points;
  }

  if (!nom || isNaN(points)) {
    alert("Nom ou points invalides.");
    return;
  }

  const li = document.createElement('li');
  li.textContent = `${nom} - ${points} pts`;
  listeJour.appendChild(li);

  form.reset();
});

// Initialisation
mettreAJourListeDeroulante();


