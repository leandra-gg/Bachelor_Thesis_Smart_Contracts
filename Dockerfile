FROM node:16-slim
RUN apt-get update && apt-get install -y software-properties-common && \
    add-apt-repository -y ppa:ethereum/ethereum && \
    apt-get update && apt-get install -y ethereum && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8545 30303
CMD ["sh", "-c", "geth --http --http.addr '0.0.0.0' --http.port 8545 --http.api 'eth,web3,personal,net' --networkid 11155111 --syncmode light & sleep 10 && npx hardhat run deploy.js --network sepolia"]
