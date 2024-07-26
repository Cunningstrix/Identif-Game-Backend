const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const VEHICLEDIR = './vehicles/'

//read questions files
var mmpQuestions;
fs.readFile('./questions/mmp.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier:', err);
    return;
  }

  // Analyser le contenu du fichier JSON
  const questionsData = JSON.parse(data);

  // Obtenir un tableau de questions
  mmpQuestions = questionsData.questions;

  // Vérifier qu'il y a des questions dans le fichier
  if (mmpQuestions.length === 0) {
    console.log('Aucune question disponible.');
    return;
  }
});


// every  response we send has these headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get('/api/subdirectories', (req, res) => {

  fs.readdir(VEHICLEDIR, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const subdirectories = files
      .filter((file) => file.isDirectory())
      .map((file) => file.name);

    res.json({ subdirectories });
  });
});

// Endpoint to get a random image from a directory
app.get('/api/random-image/:vehicles', (req, res) => {
  const directoryPath = path.join(__dirname, VEHICLEDIR + req.params.vehicles);

  fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    const imageFiles = files.filter((file) => {
      const ext = path.extname(file.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });

    if (imageFiles.length === 0) {
      return res.status(404).send('No images found in the directory');
    }

    const randomImageFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(directoryPath, randomImageFile.name);

    fs.readFile(imagePath, (readErr, data) => {
      if (readErr) {
        console.error(readErr);
        return res.status(500).send('Internal Server Error');
      }

      const contentType = getContentType(randomImageFile.name);

      res.set('Content-Type', contentType);
      res.send(data);
    });
  });
});

// Helper function to determine content type based on file extension
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

app.get('/api/mmp', (req, res) => {

  const randomIndex = Math.floor(Math.random() * mmpQuestions.length);
  const randomQuestion = mmpQuestions[randomIndex];

  res.json({
    question: randomQuestion.question,
    answer: randomQuestion.réponse
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});