DROP TABLE IF EXISTS  pracbook;
CREATE TABLE pracbook(
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  image VARCHAR(255),
  description TEXT
)
