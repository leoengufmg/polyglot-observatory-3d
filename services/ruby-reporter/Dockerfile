FROM ruby:3.3-alpine

WORKDIR /app

RUN gem install webrick

COPY services/ruby-reporter/app.rb ./

EXPOSE 4567

CMD ["ruby", "app.rb"]
