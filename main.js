var web3 = new Web3(Web3.givenProvider);
var instance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){ //access to Metamask
      instance = new web3.eth.Contract(abi, "0x84f5d9Efd7c53C029DC6680F1995b5Cb8b19E82a", {from: accounts[0]});  //allows you to interact with smart contracts as if they were JavaScript objects.
    });
    $("#add_data_button").click(inputData);
    $("#get_data_button").click(fetchAndDisplayData);
});

async function inputData(){
  var name = $("#name_input").val();
  var age = $("#age_input").val();
  var height = $("#height_input").val();

  var config = {
    value: web3.utils.toWei("1", "ether")
  };

  await instance.methods.createPerson(name, age, height).send(config)
  .on("transactionHash", function(hash){
    console.log(hash);
  })//event listener web3
  .on("confirmation", function(confirmationNr, receipt){ //will continue to be called
    if(confirmationNr > 12) {//recommended on MainNet
      console.log(confirmationNr); //this will not return anything as we are on Ganache, not real Eth.
    }})
  .on("receipt", function(receipt){
    console.log(receipt);
  })
}

async function fetchAndDisplayData(){
    await instance.methods.getPerson().call().then(function(res){
      $("#name_output").text(res.name);
      $("#age_output").text(res.age);
      $("#height_output").text(res.height);
    })
}