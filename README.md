#PriceMet - MVP

Minimum Viable Product(<a href="https://www.wikiwand.com/en/Minimum_viable_product">MVP</a>) for PriceMet 

PriceMet is a “name your own price” site for restaurants, spas and other kind of services.

##Prerequisites
 - <a href="https://nodejs.org/en/">Node.js</a>
 - <a href="http://phantomjs.org/">Phantom.js</a>

<b>Note:</b> This repository doesn't contain the offers and secret configuration file needed for the project to work. You can add your own configuration file and db with offers.

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
   - Requests offers
   - Views offer details
   - Buys offer using credit card(stripe)
   - Gets email with generated vouchers
   - No account creation neeeded
   
 - Merchant
   - Login with email and password
   - Dashboard - views offers and vouchers sold
   - Redeems vouchers
   
 - Admin
   - Login with email and password
   - Adds merchants to system

##Flow

###Client

1. Homepage
![Homepage](screenshots/home.JPG?raw=true "Homepage")
<br/><br/>
2. Offers
![Offers](screenshots/offers.JPG?raw=true "Offers")
<br/><br/>
3. Offer details
![Offer details](screenshots/offer-details.JPG?raw=true "Offer details")
<br/><br/>
4. Complete order
![Complete order](screenshots/complete-order.JPG?raw=true "Complete order")
<br/><br/>
5. Delivery and payment
![Delivery and payment](screenshots/complete-order-pay.JPG?raw=true "Delivery and payment")
<br/><br/>
6. Get email with voucher
![Get email with voucher](screenshots/email+voucher.JPG?raw=true "Get email with voucher")
<br/><br/>
7. Show voucher to merchant
![Show voucher to merchant](screenshots/voucher-pdf.JPG?raw=true "Show voucher to merchant")

---

###Merchant

1. Login
<br/><br/>
2. Check voucher number
![Check voucher number](screenshots/merchant-check-voucher.JPG?raw=true "Check voucher number")
<br/><br/>
3. Redeem voucher
![Redeem voucher](screenshots/merchant-redeem-voucher.JPG?raw=true "Redeem voucher")
<br/><br/>
4. View current offers and number of redeemed vouchers

---

###Admin

1. Login
<br/><br/>
2. Add new merchant
![Add new merchant](screenshots/admin-add-new-merchant.JPG?raw=true "Add new merchant")


##Mobile optimized experience

###Homepage
![Homepage](screenshots/mobile-home.JPG?raw=true "Homepage")

###Receive offers
![Receive offers](screenshots/mobile-receiveoffers.JPG?raw=true "Receive offers")

###Offers
![Offers](screenshots/mobile-offers.JPG?raw=true "Offers")

###Offer details
![Offer details](screenshots/mobile-offer-more-info.JPG?raw=true "Offer details")

##Started from
<a href="https://github.com/sahat/hackathon-starter">Node Hackathon Starter</a>

 

