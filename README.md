# ElGamal Kripto-sistem — Frontend

## Pokretanje

1. Backend — iz direktorijuma `ElGamal---kriptografija`:
pip install fastapi uvicorn
python -m uvicorn main:app --reload

2. Frontend — iz direktorijuma `elgamal-frontend`:
python -m http.server 3000

3. Otvoriti u pretraživaču: `http://localhost:3000`

Aplikacija se mora otvoriti u browseru, ne dvoklikom na `index.html`.

## Struktura projekta

elgamal-frontend/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── encryptPanel.js
    ├── decryptPanel.js
    ├── keysDisplay.js
    ├── iterationsTable.js
    ├── api.js
    ├── fileHandler.js
    ├── notification.js
    └── icons.js

Detaljna dokumentacija nalazi se u `ElGamal Kripto-sistem — Frontend dokumentacija.docx`.
