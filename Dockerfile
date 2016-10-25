FROM node:latest

EXPOSE 3000

RUN mkdir -p /opt/team
WORKDIR /opt/team

COPY . /opt/team
RUN rm -rf /opt/team/node_modules
RUN npm install

CMD ["bash", "-c", "node index.js" ]