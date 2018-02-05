npm install
cd frontend
npm install
npm run build
cd ../
cp -r ./frontend/react-client/dist/* /var/www/hypotheticalmeals.com/html
cross-env NODE_ENV=production nodemon --exec babel-node server/server.js