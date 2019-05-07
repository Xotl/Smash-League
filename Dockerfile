FROM node:11

WORKDIR /usr/app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install


ARG NODE_ENV=dev

# RUN if [ $NODE_ENV = "dev" ] ; then npm install -g firebase-tools ; fi

COPY . .
RUN if [ $NODE_ENV != "dev" ] ; then npm version patch; fi

EXPOSE 9229
EXPOSE 3000
CMD ["npm", "start"]