FROM node:11

WORKDIR /usr/app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install


ARG NODE_ENV=dev

COPY . .

EXPOSE 9229
EXPOSE 3000
CMD ["npm", "start"]