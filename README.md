#PriceMet - MVP

Minimum Viable Product(<a href="https://www.wikiwand.com/en/Minimum_viable_product">MVP</a>) for PriceMet 

PriceMet is a “name your own price” site for restaurants, spas and other kind of services.

##Prerequisites
 - <a href="https://nodejs.org/en/">Node.js</a>
 - <a href="http://phantomjs.org/">Phantom.js</a>

<b>Note:</b> This repository doesn't contain the offers and secrets configuration file needed for the project to work. You can add your own configuration file and db with offers.

##Built with
 - Frontend:
   - Angular.js
   - Bootstrap

 - Backend
   - Node.js
   - Express.js
   - Phantom.js -> for voucher generation
   
 - Database:
   - MongoDB hosted on <a href="https://mlab.com/">mLab<a/>

##Roles
 - Client
 - Merchant
 - Admin

- Flow -> find offer, pay, redeem
- Merchant part -> redeem

Payment integration: Stripe
Email sending: SendGrid


##Started from
<a href="https://github.com/sahat/hackathon-starter">Node Hackathon Starter</a>

 

