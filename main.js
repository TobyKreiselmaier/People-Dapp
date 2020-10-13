var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){ //access to Metamask
      contractInstance = new web3.eth.Contract(window.abi, "0x3D2e35244eEa9d29Cd085776d5d1ff9e3E0Ec16E", {from: accounts[0]});  //allows you to interact with smart contracts as if they were JavaScript objects.
      console.log(contractInstance);
    });
    $("#add_data_button").click(inputData)
    $("#get_data_button").click(fetchAndDisplayData)
});

function inputData(){
  var name = $("#name_input").val();
  var age = $("#age_input").val();
  var height = $("#height_input").val();

  var config = {
    value: web3.utils.toWei("1", "ether")
  };

  contractInstance.methods.createPerson(name, age, height).send(config)
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

function fetchAndDisplayData(){
    contractInstance.methods.getPerson().call().then(function(res){
      $("#name_output").text(res.name);
      $("#age_output").text(res.age);
      $("#height_output").text(res.height);
    })



}
