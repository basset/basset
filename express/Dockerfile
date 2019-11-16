FROM node:10.14.1
EXPOSE 3000

WORKDIR /basset/

COPY . /basset/
RUN npm install --production

# run server

USER node

CMD ["node", "./bin/www"]