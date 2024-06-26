CREATE TABLE gosti (
  username VARCHAR(50) PRIMARY KEY UNIQUE,
  email VARCHAR(50) NOT NULL UNIQUE,
  lozinka VARCHAR(50) NOT NULL UNIQUE
)

CREATE TABLE recenzije(
  id SERIAL PRIMARY KEY,
  tekst VARCHAR(50),
  ocjena INTEGER CHECK (ocjena BETWEEN 1 AND 5),
  username VARCHAR(50) REFERENCES gosti(username)
)