# README

How to run locally:

    rbenv install (optional)
    gem install bundler
    bundle install
    export DATABASE_URL="postgresql://username:password@localhost/database"
    rails s

How to run dockerized:

    Install Docker for Mac
    docker build .
    docker-compose exec web bundle exec rake db:migrate
    docker-compose exec web bundle exec rake db:seed
    docker-compose up
