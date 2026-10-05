## Tables:

## USERS:

- id PRIMARY KEY INDEX (INT UNIQUE AUTO_INCREMENT NOTNULL)
- email_address INDEX (VARCHAR(50) UNIQUE )
- password_hash (VARCHAR(50) )
- account_type (ENUM:('REGISTRATO', 'OSPITE') NOTNULL)
- created_at (DATETIME NOTNULL)

## LOBBYS:

- id PRIMARY KEY INDEX (INT UNIQUE AUTO_INCREMENT NOTNULL)
- lobby_code INDEX (VARCHAR(10) UNIQUE NOTNULL) (Il codice tipo XFDE per il link)
- admin_id FOREIGN KEY references USERS(id) (INT NOTNULL) (Chi comanda la stanza)
- global_status (ENUM:('LOBBY', 'IN_GIOCO', 'RISULTATI') NOTNULL DEFAULT 'LOBBY')
- current_game_id FOREIGN KEY references GAMES(id) (VARCHAR(50)) (NULL se sono in lobby)
- created_at (DATETIME NOTNULL)


## GAMES:

- id PRIMARY KEY INDEX (INT UNIQUE AUTO_INCREMENT NOTNULL)
- title (VARCHAR(100) NOTNULL) (Es: 'L'Impostore 🕵️‍♂️')
- description (TEXT NOTNULL) (Le regole del gioco)
- min_players (INT NOTNULL)
- max_players (INT )


## LOBBY_PLAYERS:
- lobby_id FOREIGN KEY references LOBBYS(id) (INT NOTNULL)
- user_id FOREIGN KEY references USERS(id) (INT NOTNULL)
- nickname (VARCHAR(30) NOTNULL) (Il nome scelto per la serata, libero e non unico)
- connection_status (ENUM:('ONLINE', 'OFFLINE') NOTNULL DEFAULT 'ONLINE')
- game_data (JSON) (Il jolly! Qui dentro salvi i ruoli segreti in formato JSON)
- joined_at (DATETIME NOTNULL)
- CONSTRAINT UNIQUE (lobby_id, user_id) (Impedisce lo sdoppiamento dello stesso utente nella stessa stanza)