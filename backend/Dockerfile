FROM node:24-alpine
# move into or creat and move into dir
WORKDIR /app/backend
# copy codes
COPY ./backend/package*.json ./
# copy dependencies
RUN npm install

CMD ["npm", "run", "start:dev"]
