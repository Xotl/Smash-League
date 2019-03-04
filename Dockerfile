FROM node:10.15.1

WORKDIR /usr/app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install


ARG NODE_ENV=dev

# RUN if [ $NODE_ENV = "dev" ] ; then npm install -g firebase-tools ; fi

COPY . .
RUN if [ $NODE_ENV != "dev" ] ; then npm version patch; fi

EXPOSE 9229
CMD ["node", "./src/index.js"]