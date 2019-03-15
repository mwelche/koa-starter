# if you dont have mongodb already setup
brew install mongodb
brew tap homebrew/services

sudo mkdir -p /data/db
sudo chown -R `id -u` /data/db
sudo chmod -R go+w /data/db

brew services start mongodb

