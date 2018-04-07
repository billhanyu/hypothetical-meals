cat "deploying" > deploy.txt
git pull
docker build -t meals .
docker run -d -p 1717:80 meals