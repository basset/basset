FROM node:10.14.1
EXPOSE 3000

# copy and install express app
WORKDIR /basset/
COPY express /basset
# remove any previous build files
RUN rm -rf static/dist
RUN npm install --production

# copy and install react app
WORKDIR /basset-react/
COPY react /basset-react
RUN npm install
RUN npm run build
RUN mv -f dist ../basset/static
# cleanup files not needed
RUN rm -rf /basset-react

# run server
WORKDIR /basset/
USER node
CMD ["node", "./bin/www"]