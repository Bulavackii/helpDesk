const http = require('http');
const Koa = require('koa')
const cors = require('@koa/cors');
const koaBody = require('koa-body').default;
const app = new Koa();


const corsOptions = {
  origin: '*',
  credentials: true,
  'Access-Control-Allow-Origin': true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

const tickets = [
  {
    id: 1,
    name: 'Поменять краску в принтере, ком. 404',
    status: false,
    description: 'Поменять краску в принтере, ком. 404',
    created: new Date(2019, 3, 10, 8, 40),
  },
  {
    id: 2,
    name: 'Переустановить Windows, ПК-Hall24',
    status: false,
    description: 'Переустановить Windows, ПК-Hall24',
    created: new Date(2019, 3, 15, 12, 35),
  },
  {
    id: 3,
    name: 'Установить обновление KB-XXX',
    status: true,
    description: 'Установить обновление KB-XXX',
    created: new Date(2019, 3, 15, 12, 40),
  }
];

app.use(async ctx => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
  });
  
  const { method } = ctx.request.query;
  
  switch (method) {
    case 'allTickets':
      ctx.response.body = tickets.map(({description, ...ticket}) => (ticket));
      return;
    case 'ticketById': {
      const { id: idTicket } = ctx.request.query;
      let getTicket;
      tickets.forEach((ticket) => {
        if (ticket.id === parseInt(idTicket)) {
          getTicket = ticket;
        }
      })
      ctx.response.body = getTicket;
      return
    }
    case 'createTicket': {
      if (ctx.request.method !== 'POST') {
        ctx.response.status = 404;
        return;
      }
      const data = ctx.request.body;
      const ticket = {
        id: (tickets[tickets.length - 1]).id + 1,
        name: data.name,
        status: JSON.parse(data.status),
        description: data.description,
        created: new Date(),
      }
      tickets.push(ticket);
      ctx.response.body = tickets;
      return;
    }
    case 'deleteTicket': {
      if (ctx.request.method !== 'DELETE') {
        ctx.response.status = 404;
        return;
      }
      const { id: idTicket } = ctx.request.query;
      const ind = tickets.findIndex((tic) => tic.id === parseInt(idTicket));
      tickets.splice(ind, 1);
      ctx.response.body = tickets;
      return;
    }
    case 'editTicket': {
      if (ctx.request.method !== 'PUT') {
        ctx.response.status = 404;
        return;
      }
      const data = ctx.request.body;
      const ticket = {
        id: parseInt(data.id),
        name: data.name,
        status: JSON.parse(data.status),
        description: data.description,
        created: data.created,
      }
      const ind = tickets.findIndex((tic) => tic.id === parseInt(data.id));
      tickets.splice(ind, 1, ticket);
      ctx.response.body = tickets;
      return;
    }
    default: {
      ctx.response.status = 404;
      return;
    }     
  } 
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
server.listen(port, () => console.log('server started'));


