const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract("People", async function(accounts){// state of contract is preserved within.

  let instance;
  //beforeEach(async function(){ //runs before each 'it' (Mocha)
  //beforeEach(async function(){
  //after() can also be used.
  //afterEach()
  before(async function(){
    instance = await People.deployed();
  });

  it("shouldn't create a person with age 150 years or older", async function(){
    await truffleAssert.fails(instance.createPerson("Bob", 200, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT); //functionality of truffle-assertions FW
      // this must revert in order for the contract to work.
  });
  it("shouldn't create a person without payment", async function(){
    await truffleAssert.fails(instance.createPerson("Bob", 50, 190, {value: 1000}), truffleAssert.ErrorType.REVERT);
  });
  it("should set senior status correctly", async function(){
    await instance.createPerson("Bob", 65, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.senior === true, "Senior status not set.");
  });
  it("should set age correctly", async function(){
    await instance.createPerson("Bob", 65, 190, {value: web3.utils.toWei("1", "ether")});
    let result = await instance.getPerson();
    assert(result.age.toNumber() === 65, "Age not set correctly.");
  });
  it("should not allow non-owner to delete a person.", async function(){
    await instance.createPerson("Lisa", 35, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.reverts(instance.deletePerson(accounts[2], {from: accounts[2]}));
  });
  it("should allow the owner to delete a person.", async function(){
    let instance = await People.new();
    await instance.createPerson("Lisa", 30, 180, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.deletePerson(accounts[1]), {from: accounts[0]});
  });
//When person is added, balance of contract is increased and balance in contract matches balance for contract address on BC.
//Contract owner can withdraw balance. Then balance = 0, and SC = 0;
//web.eth.getBalance() will query Blockchain for balance of account.
  it("should change the balance of the contract correctly when a person is added to the mapping.", async function(){
    let instance = await People.new();
    let balanceStart = await instance.balance();
    await instance.createPerson("Bob", 65, 190, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    let balanceEnd = await instance.balance();
    assert(balanceStart < balanceEnd, "balance not changed correctly.");
  });
  it("should allow the owner to withdraw balance", async function(){
    let instance = await People.new();
    await instance.createPerson("Bob", 65, 190, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
  });
  it("should NOT allow a non-owner to withdraw balance", async function(){
    let instance = await People.new();
    await instance.createPerson("Bob", 65, 190, {from: accounts[0], value: web3.utils.toWei("1", "ether")});
    await truffleAssert.reverts(instance.withdrawAll({from: accounts[1]}));
  });
  it("owners balance should increase after withdrawal", async function(){
   let instance = await People.new();
   await instance.createPerson("Lisa", 35, 160, {from: accounts[2], value: web3.utils.toWei("1", "ether")});
   let balanceStart = parseFloat(await web3.eth.getBalance(accounts[0]));
   await instance.withdrawAll({from: accounts[0]});
   let balanceEnd = parseFloat(await web3.eth.getBalance(accounts[0]));
   assert(balanceStart < balanceEnd, "Owners balance was not increased after withdrawal");
  });
  it("contract balance should reset to 0 after withdrawal", async function(){
    let instance = await People.new();
    await instance.createPerson("Lisa", 35, 160, {from: accounts[1], value: web3.utils.toWei("1", "ether")});
    await instance.withdrawAll();
    let balance = await instance.balance();
    let contractBalance = parseFloat(balance);//balance from contract variable
    let blockchainBalance = await web3.eth.getBalance(instance.address);//balance as recorded by the blockchain
    assert(contractBalance == web3.utils.toWei("0", "ether"), "Contract balance was not 0 after withdrawal");
    assert(blockchainBalance == web3.utils.toWei("0", "ether"), "Balance on Blockchain was not 0 after withdrawal");
    assert(contractBalance == blockchainBalance, "Contract balance and balance on Blockchain were not the same.");
  });
});
