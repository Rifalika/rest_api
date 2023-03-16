'use strict';

const Hapi = require('hapi');
const fs = require('fs');
const util = require('util');

// Convert fs.readFile, fs.writeFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/contacts',
    options: {
        handler: async (request, h) => {
            const contacts = await readFile('./contacts.json', 'utf8');
            return h.response(JSON.parse(contacts));
        }
    }
});

server.route({
    method: 'POST',
    path: '/contacts',
    options: {
        handler: async (request, h) => {
            const contact = JSON.parse(request.payload);
            let contacts = await readFile('./contacts.json', 'utf8');
            contacts = JSON.parse(contacts);
            // setting id
            contact.id = contacts.length + 1;
            contacts.push(contact);
            await writeFile('./contacts.json', JSON.stringify(contacts, null, 2), 'utf8');
            return h.response(contacts).code(200);
        }
    }
});

server.route({
    method: 'PUT',
    path: '/contacts/{id}',
    options: {
        handler: async (request, h) => {
            const updContact = JSON.parse(request.payload);
            const id = request.params.id;
            let contacts = await readFile('./contacts.json', 'utf8');
            contacts = JSON.parse(contacts);
            // finding contact by id and rewriting
            contacts.forEach((contact) => {
                if (contact.id == id) {
                    contact.address = updContact.address;
                    contact.name = updContact.name;
                }
            });
            await writeFile('./contacts.json', JSON.stringify(contacts, null, 2), 'utf8');
            return h.response(contacts).code(200);
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/contacts/{id}',
    options: {
        handler: async (request, h) => {
            const updContact = JSON.parse(request.payload);
            const id = request.params.id;
            let contacts = await readFile('./contacts.json', 'utf8');
            contacts = JSON.parse(contacts);
            // rewriting the contacts array
            contacts = contacts.filter(contact => contact.id != id);
            await writeFile('./contacts.json', JSON.stringify(contacts, null, 2), 'utf8');
            return h.response(contacts).code(200);
        }
    }
});

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
