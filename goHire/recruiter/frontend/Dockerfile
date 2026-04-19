FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=optional \
	&& npm cache clean --force

COPY . .

EXPOSE 5175

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5175"]
