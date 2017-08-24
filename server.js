var express = require('express'),
    cors = require('cors'),
    app = express();
//var router = express.Router();
var bodyParser = require('body-parser');
var Web3 = require('web3');

var Tx = require('ethereumjs-tx');
var _ = require('lodash');

var SolidityFunction = require('web3/lib/web3/function');
var keythereum = require("keythereum");

var request = require('request');

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//session configs
var expressSession = require('express-session');
var cookieParser = require('cookie-parser'); // the session is stored in a cookie, so we use this to parse it


app.use(cookieParser());

app.use(expressSession({
    secret: 'test_session',
    resave: false,
    saveUninitialized: true
}));


//For enabling CORS
app.use(cors());


var web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://10.0.0.13:8545"));
    //console.log(web3.net.peerCount);
}

var Web3EthAccounts = require('web3-eth-accounts');

var account = new Web3EthAccounts('ws://10.0.0.13:8546');


//web3.eth.defaultAccount = 0xaf148d7e9c5a1f6ee493f0a808fdc877953bf273;
web3.eth.defaultAccount = web3.eth.accounts[0];

//contract data
var tgwTokenContractABI = [{"constant":true,"inputs":[],"name":"_advisorsFundSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"crowdsaleOn","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"individualIncentiveFundSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"advisorsFundSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCrowdsaleStartDate","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"crowdsaleEndsOn","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"recipient","type":"address"}],"name":"crowdsale","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"multisig","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"_crowdsaleSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"who","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"_founderAndEmployeeSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"_individualIncentiveFundSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"crowdsaleStartsOn","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"PRICE","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getPrice","outputs":[{"name":"result","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"startCrowdsale","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"pauseCrowdsale","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"fundRaised","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"crowdsaleSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCrowdsaleEndDate","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"founderAndEmployeeSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_decimals","type":"uint256"},{"name":"_initalSupply","type":"uint256"},{"name":"_multisig","type":"address"},{"name":"_tokenPrice","type":"uint256"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];

// Kovan Network
var tgwTokenContractAddress = "0x100ddd47535df7a0b7dc3f141df31af1960a54b8";

// Main Network
//var tgwTokenContractAddress = "0x44e8052A7cfdBaA497244363C6BfeD93740a2B0c";

var tgwTokenContract = web3.eth.contract(tgwTokenContractABI).at(tgwTokenContractAddress);;

app.get('/', function(req, res) {
    res.send("This is the API server developed for ICO Token Contract");
});

app.post('/createAccount', function(req, res) {
    var password = req.body._password;
    var result = account.create();
    var address = result.address;
    var privateKey = result.privateKey;

    var encryptedResult = account.encrypt(privateKey, password);

    res.json({"Address" : address, "PrivateKey" : privateKey, "Keystore" : encryptedResult});
});

app.post('/accessAccountUsingKeystore', function(req, res) {
    var Keystore = req.body.Keystore;
    var password = req.body._password;
    var result = account.decrypt(Keystore, password);

    var address = result.address;
    var privateKey = result.privateKey;

    res.json({"Address" : address, "PriateKey" : privateKey});
});

app.post('/accessAccountUsingPrivateKey', function(req, res) {
    var privateKey = req.body._privateKey;
    var result = account.privateKeyToAccount(privateKey);

    var address = result.address;
    var privateKey = result.privateKey;
    res.json({"Address" : address, "PriateKey" : privateKey});
});

app.post('/myTokenBalance', function(req, res) {
  var address = req.body._address;
  tgwTokenContract.balanceOf.call(address, function(err, result) {
      //console.log(result);
      if (!err) {
          res.json({"balance":result});
      } else
          res.status(401).json("Error" + err);
  });
});

app.post('/transferToken', function(req, res) {
  var fromaddress = req.body._fromaddress;
  var toaddress = req.body._toaddress;
  var amount = req.body._amount;
  var privatekey = req.body._privatekey;

  // step 1
  var solidityFunction = new SolidityFunction('', _.find(tgwTokenContractABI, { name: 'transfer' }), '');

  //console.log(solidityFunction);

  // Step 2
  var payloadData = solidityFunction.toPayload([toaddress, amount]).data;

  //console.log(payloadData);

  // Step 3
  gasPrice = web3.eth.gasPrice;
  gasPriceHex = web3.toHex(gasPrice);
  gasLimitHex = web3.toHex(300000);

  nonce =  web3.eth.getTransactionCount(fromaddress) ;
  nonceHex = web3.toHex(nonce);

  var rawTx = {
      nonce: nonceHex,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      to: tgwTokenContractAddress,
      from: fromaddress,
      value: '0x00',
      data: payloadData
  };

  // Step 4
  var key = Buffer.from(privatekey, 'hex');
  var tx = new Tx(rawTx);
  tx.sign(key);

  var serializedTx = tx.serialize();

  web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
      if (err) {
          res.status(401).json("" + err);
      }
      else {
          res.json({"status":true, "hash" : hash});
      }
  });
});

app.post('/buyToken', function(req, res) {
  var fromaddress = req.body._fromaddress;
  var amount = req.body._amount;
  var privatekey = req.body._privatekey;

  // Step 1
  var payloadData = web3.toHex(web3.toWei(amount, 'ether'));

  // Step 2
  gasPrice = web3.eth.gasPrice;
  gasPriceHex = web3.toHex(gasPrice);
  gasLimitHex = web3.toHex(300000);

  nonce =  web3.eth.getTransactionCount(fromaddress) ;
  nonceHex = web3.toHex(nonce);

  var rawTx = {
      nonce: nonceHex,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      to: tgwTokenContractAddress,
      from: fromaddress,
      value: payloadData,
      data: '0x00'
  };

  // Step 3
  var key = Buffer.from(privatekey, 'hex');
  var tx = new Tx(rawTx);
  tx.sign(key);

  var serializedTx = tx.serialize();

  web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
      if (err) {
          res.status(401).json("" + err);
      }
      else {
          res.json({"status":true, "hash" : hash});
      }
  });
});

app.get('/getArgEncoded', function(req, res) {
  var abi = require('ethereumjs-abi')

  var parameterTypes = ["string", "string", "uint", "uint", "address", "uint"];
  var parameterValues = ["Twogap Token", "TGW", 8, 1000000000, "0x92B2cda75898ffA81219c0440a15aCC7A52d193a", 300];

  var encoded = abi.rawEncode(parameterTypes, parameterValues);

  var result = encoded.toString('hex');

  res.json({"result" : result});
});

app.listen(3001, function() {
    console.log('app running on port : 3001');
});
