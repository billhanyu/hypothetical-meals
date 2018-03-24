const chai = global.chai = require('chai');
const chaiHttp = require('chai-http');
import server from '../../server/server';
global.server = server;
chai.should();
chai.use(chaiHttp);
