# README
cat > README.md <<'TXT'
# Country App (Backend + React Frontend)

## Backend
- Run: `npm run dev` at project root (http://localhost:3000)
- Env (.env):
  PORT=3000
  BASE_URL=https://restcountries.com/v3.1
  CACHE_TTL_SECONDS=600

## Frontend
- Run: `cd country-frontend && npm start` (http://localhost:3001)
- Env (country-frontend/.env):
  REACT_APP_API_URL=http://localhost:3000
TXT

# env example files (so you don't commit real secrets)
printf "PORT=3000\nBASE_URL=https://restcountries.com/v3.1\nCACHE_TTL_SECONDS=600\n" > .env.example
printf "REACT_APP_API_URL=http://localhost:3000\n" > country-frontend/.env.example

git add -A
git commit -m "docs: add README and .env.example files"
git push
