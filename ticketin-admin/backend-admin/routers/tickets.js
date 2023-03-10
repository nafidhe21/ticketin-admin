const Ticket = require('../models/tickets');
const Concert = require('../models/concerts');
const express = require('express');
const fetch = require('node-fetch');
const { default: mongoose } = require('mongoose');
const router = express.Router();


/*********************** POST *************************/

router.post(`/`, async (req, res) => {
  let ticket_id;
  let concert_id = req.body.concert_id;
  let concert = await Concert.findById(concert_id);
  if(!concert) {
    return res.status(404).send('concert with id not found');
  }

  let price = (req.body.A1_am * concert.classPrices.A1) + (req.body.A2_am * concert.classPrices.A2) + (req.body.A3_am * concert.classPrices.A3);
  
  let ticket = new Ticket({
    concert_id: req.body.concert_id,
    user_id: req.body.user_id,
    concertDate: req.body.concertDate,
    amount: {
      A1_am: req.body.A1_am,
      A2_am: req.body.A2_am,
      A3_am: req.body.A3_am,
    },
    price: price,
  })
    
  ticket = await ticket.save();

  if(!ticket)
    return res.status(404).send('the ticket cannot be created...');

  ticket_id = await ticket._id.valueOf();
  console.log(ticket_id)

  const body = {
    "transaction_details": {
      "order_id": ticket_id,
      "gross_amount": price
    }, 
    "credit_card": {
      "secure": true
    }
  }

  const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
    method: 'post',
    body: JSON.stringify(body),
    headers:{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic U0ItTWlkLXNlcnZlci0wb2xjTUpHeHV5dFp4aUh1cWxzRjlsbFo6'
    } 
  })

  const url = await response.json();

  res.send(url);

})

/*********************** GET *************************/

// get all ticket
router.get(`/`, async (req, res) => {
  const ticketList = await Ticket.find();

  if(!ticketList) {
    res.status(500).json({success: false});
  }
  res.send(ticketList); 
});

// count total ticket purchased by concert_id
router.get('/getTotalTicketPurchased/:concert_id', async (req, res) => {
  const concert_id = req.params.concert_id;

  const totalTicketPurchased = await Ticket.aggregate([
    {$match: { "concert_id": mongoose.Types.ObjectId(concert_id)}},
    {$count: "total pembeli"}
  ])

  return res.send(totalTicketPurchased);
});

// get total tickket purchased by concert class A1
router.get('/getTotalTicketPurchased/:concert_id/A1', async (req, res) => {
  const concert_id = req.params.concert_id;

  const totalPurchase = await Ticket.aggregate([
    {$match: { "concert_id": mongoose.Types.ObjectId(concert_id), payed: true}},
    {$group: { _id: null, totalPurchase: {$sum: "$amount.A1_am"}}}
  ])

  if(!totalPurchase) {
  return res.status(500).send('unsuccessful');
  }

  return res.status(200).json({totalConsumerA1: totalPurchase[0].totalPurchase});
})


// get total tickket purchased by concert class A2
router.get('/getTotalTicketPurchased/:concert_id/A2', async (req, res) => {
  const concert_id = req.params.concert_id;

  const totalPurchase = await Ticket.aggregate([
    {$match: { "concert_id": mongoose.Types.ObjectId(concert_id), payed: true}},
    {$group: { _id: null, totalPurchase: {$sum: "$amount.A2_am"}}}
  ])

  if(!totalPurchase) {
  return res.status(500).send('unsuccessful');
  }

  return res.status(200).json({totalConsumerA2: totalPurchase[0].totalPurchase});
})

// get total tickket purchased by concert class A3
router.get('/getTotalTicketPurchased/:concert_id/A3', async (req, res) => {
  const concert_id = req.params.concert_id;

  const totalPurchase = await Ticket.aggregate([
    {$match: { "concert_id": mongoose.Types.ObjectId(concert_id), payed: true}},
    {$group: { _id: null, totalPurchase: {$sum: "$amount.A3_am"}}}
  ])

  if(!totalPurchase) {
  return res.status(500).send('unsuccessful');
  }

  return res.status(200).json({totalConsumerA3: totalPurchase[0].totalPurchase});
})

// get total money by concert class A1
router.get('/getTotalPurchase/:concert_id/A1', async (req, res) => {
  const concert_id = req.params.concert_id;
  const concert = await Concert.findById(req.params.concert_id);

  const totalPurchase = await Ticket.aggregate([
    {$match: { "concert_id": mongoose.Types.ObjectId(concert_id), payed: true}},
    {$group: { _id: null, totalPurchase: {$sum: "$amount.A1_am"}}}
  ])

  if(!totalPurchase) {
  return res.status(500).send('unsuccessful');
  }

  console.log(concert.classPrices.A1)
  console.log(totalPurchase[0].totalPurchase)
  const totalMoney = totalPurchase[0].totalPurchase * concert.classPrices.A1;

  return res.status(200).json({totalA1: totalMoney});
})

// get total money by concert class A2
router.get('/getTotalPurchase/:concert_id/A2', async (req, res) => {
  const concert_id = req.params.concert_id;
  const concert = await Concert.findById(req.params.concert_id);

  const totalPurchase = await Ticket.aggregate([
    {$match: { "concert_id": mongoose.Types.ObjectId(concert_id), payed: true}},
    {$group: { _id: null, totalPurchase: {$sum: "$amount.A2_am"}}}
  ])

  if(!totalPurchase) {
  return res.status(500).send('unsuccessful');
  }

  console.log(concert.classPrices.A2)
  console.log(totalPurchase[0].totalPurchase)
  const totalMoney = totalPurchase[0].totalPurchase * concert.classPrices.A2;

  return res.status(200).json({totalA2: totalMoney});
})

// get total money by concert class A3
router.get('/getTotalPurchase/:concert_id/A3', async (req, res) => {
  const concert_id = req.params.concert_id;
  const concert = await Concert.findById(req.params.concert_id);

  const totalPurchase = await Ticket.aggregate([
    {$match: { "concert_id": mongoose.Types.ObjectId(concert_id), payed: true}},
    {$group: { _id: null, totalPurchase: {$sum: "$amount.A3_am"}}}
  ])

  if(!totalPurchase) {
  return res.status(500).send('unsuccessful');
  }

  console.log(concert.classPrices.A3)
  console.log(totalPurchase[0].totalPurchase)
  const totalMoney = totalPurchase[0].totalPurchase * concert.classPrices.A3;

  return res.status(200).json({totalA3: totalMoney});
})


// get ticket by id
router.get('/:id', async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if(!ticket) {
    res.status(500).json({message: 'The ticket with the given ID was not found.'})
  }
  res.status(200).send(ticket);

})

// get success ticket by user id
router.get('/byUser/success/:user_id', async (req, res) => {
  const ticket = await Ticket.find({user_id: req.params.user_id, payed: true});

  if(!ticket) {
    res.status(500).json({message: 'The ticket with the given ID was not found.'})
  }
  res.status(200).send(ticket);

})

// get failed ticket by user id
router.get('/byUser/failed/:user_id', async (req, res) => {
  const ticket = await Ticket.find({user_id: req.params.user_id, payed: false});

  if(!ticket) {
    res.status(500).json({message: 'The ticket with the given ID was not found.'})
  }
  res.status(200).send(ticket);

})

// get all ticket (failed & success) by user id
router.get('/byUser/:user_id', async (req, res) => {
  const ticket = await Ticket.find({user_id: req.params.user_id});

  if(!ticket) {
    res.status(500).json({message: 'The ticket with the given ID was not found.'})
  }
  res.status(200).send(ticket);

})

// get ticket by concert_id
router.get('/byConcert/:concert_id', async (req, res) => {
  const ticket = await Ticket.find({concert_id: req.params.concert_id, payed: true});

  if(!ticket) {
    res.status(500).json({message: 'The ticket with the given ID was not found.'})
  }
  res.status(200).send(ticket);

})

/*********************** DELETE *************************/

// delete ticket by id
router.delete('/:id', async (req, res)=> {
  Ticket.findByIdAndRemove(req.params.id).then(ticket => {
    if(ticket) {
      return res.status(200).json({success: true, message: 'the ticket has been deleted'});
    } else {
      return res.status(404).json({success: false, message: 'the ticket not found'});
    }
  }).catch(err=>{
    return res.status(400).json({success: false, error: err})
  })
})

/*********************** PUT *************************/

// update ticket status by user id
router.put('/updateTicket/:user_id', async (req, res) => {
  let startDate = new Date();
  startDate = new Date(startDate.setDate(startDate.getDate()-1)).toISOString().split('T')[0];
  let endDate = new Date();
  endDate = new Date(endDate.setDate(endDate.getDate()+1)).toISOString().split('T')[0];

  const ticket = await Ticket.find({user_id: mongoose.Types.ObjectId(req.params.user_id),createdAt: {$gte: startDate, $lte: endDate }}, {_id:1});
  
  for (let i = 0; i < ticket.length; i++) {
    let id = ticket[i]._id.valueOf();
    const response = await fetch(`https://api.sandbox.midtrans.com/v2/${id}/status`, {
      method: 'get',
      headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic U0ItTWlkLXNlcnZlci0wb2xjTUpHeHV5dFp4aUh1cWxzRjlsbFo6'
      } 
    })

    const url = await response.json();
    console.log(id)
    console.log(url.status_code)

    if(url.status_code == "200") {
      let tempTicket = await Ticket.findByIdAndUpdate(
        id,
        {
          payed: true
        },
        {new: true}
      )
    }

  } 

  res.send('payment updated')
})

module.exports = router;
