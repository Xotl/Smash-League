FROM node:10.15.1

WORKDIR /usr/app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

COPY . .

CMD ["node", "./src/index.js"]