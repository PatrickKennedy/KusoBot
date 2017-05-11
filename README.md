About
===
KusoBot is a Discord bot built around the specific needs of the Kusogrande tournament. As of this writing it provides a means of conveniently interacting with the Kusogrande schedule hosted in Google Docs; however, as the event grows it may perform additional tasks such as interacting with a Twitter bot for sending notifications and receiving confirmations.

KusoBot depends on KusoServices for it's interaction with Google Docs. Future interactions will likely be managed by KusoServices with several microservices branching off it.

Deploying
===
Like KusoServices KusoBot is built on Docker generally tailored for use on Dokku (though most of the additional work is in configuring dokku). I'm using Dokku for deployments for two reasons:
  1. I already have Dokku configured on a DigitalOcean droplet
  2. I don't want to pay $60/mo to run a Deis kubernetes cluster (it's not entirely clear if Deis can run on anything less than 4gb ram/host)


Dokku
---
Some general steps for deploying on Dokku (may not include other dokku setup procedures). These are very similar to the KusoServices steps:
```bash
# create an app
dokku apps:create kuso-bot

# configure the app
dokku config:set kuso-bot NODE_ENV=production ...

# if necessary, create the Docker network
docker network create --drive bridge kuso-network

# configure Dokku to attach to the network
dokku docker-options:add deploy kuso-bot "--network kuso-network"
```

Once deployed the bot will announce itself in the guilds it's a part of and will be online in the userlist. This announcement will eventually be configurable.

After deploying you can check to make sure kuso-bot attached to the network and DNS is working correctly.
```bash
# check the to see that kuso-bot.web.1 is listed in the network
docker network inspect kuso-network

# execute into a bash prompt on the bot container
docker exec -it kuso-bot.web.1 bash

# wget the kuso-services host to ensure DNS connectivity works
wget -qO- kuso-services.web.1:3000
```
