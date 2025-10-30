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
