## Tables:

Tabella utenti per salvare le informazioni degli utenti registrati
(appunto: per ogni utente c'è una lista di giochi preferiti)

Tabella giochi
serve inserirla nel datbase? Beh direi di si, è un po come i prodotti nell'ecommerce. però sorge un problema, non è detto che ogni singolo gioco contenga le stesse informazioni, quindi come gestisco la cosa?
facciamo un esempio: 
lupus e l'impostore.
sicuramente ognuno dei due giochi ha cose come un titolo, il testo relativo alle regole, il numero di giocatori, che so la difficoltà e altre cose. ma detto questo i due giochi funzionano in maniera completamente diversa. beh ma il funzionamentpo del gioco sicuramente è una roba tutto lato frontend i guess? immagino comunque che le informazioni sul singolo gioco e magari (forse sopratutto), il reindirizzamento all'url giusto per il gioco possano essere messi lato backend, anche solo per essere ipoteticamente inseriti all'interno della lista dei preferiti dell'utente.

le sessioni sono letteralmente sessioni quindi non c'e alcun motivo di inserirle in backend.


## Utenti:

- id PRIMARY KEY INDEX (INT UNIQUE AUTO_INCREMENT NOTNULL)
- email_address INDEX (VARCHAR(50) UNIQUE NOTNULL)
- password (VARCHAR(50) NOTNULL)
- nickname (VARCHAR(50) NOTNULL)


## Games:

- id PRIMARY KEY INDEX (MEDIUMINT UNIQUE AUTO_INCREMENT NOTNULL)
- title INDEX (VARCHAR(50) UNIQUE NOTNULL)
- rules (TEXT NOTNULL)
- max_players (TINYINT)